import { useEffect, useRef, useState } from 'react';

import { getQuestionAnalysis } from '../api';
import type {
  QuestionAnalysisResult,
  QuestionResponseAnalysisWrapper,
} from '../types';

type UseQuestionAnalysisOptions = {
  surveyUuid: string | null;
  enabled?: boolean;
};

type QuestionAnalysisState = {
  [questionId: number]: QuestionAnalysisResult;
};

/**
 * 설문 질문별 AI 분석 결과 페칭 훅 (SSE)
 */
function useQuestionAnalysis({
  surveyUuid,
  enabled = true,
}: UseQuestionAnalysisOptions) {
  // 단일 객체 상태로 통합
  const [state, setState] = useState({
    data: {} as QuestionAnalysisState,
    error: null as Error | null,
    status: 'idle' as 'idle' | 'loading' | 'complete' | 'error',
  });

  // ref를 사용해 중복 요청 방지 (React StrictMode 대응)
  const requestedSurveyUuidRef = useRef<string | null>(null);
  const isRequestingRef = useRef(false);

  // Derived state (계산된 값)
  const isLoading = state.status === 'loading';
  const isError = state.status === 'error';
  const isComplete = state.status === 'complete';

  useEffect(() => {
    if (!surveyUuid || !enabled) {
      return;
    }

    // 이미 요청 중이거나 같은 surveyUuid로 완료된 요청이 있으면 스킵
    if (isRequestingRef.current || surveyUuid === requestedSurveyUuidRef.current) {
      return;
    }

    requestedSurveyUuidRef.current = surveyUuid;
    isRequestingRef.current = true;

    // eslint-disable-next-line react-hooks/set-state-in-effect
    setState({ data: {}, error: null, status: 'loading' });

    let cleanupFn: (() => void) | null = null;
    let isCancelled = false;

    getQuestionAnalysis(
      surveyUuid,
      (wrapper: QuestionResponseAnalysisWrapper) => {
        try {
          const parsed: QuestionAnalysisResult = JSON.parse(
            wrapper.result_json
          );
          setState((prev) => ({
            ...prev,
            data: {
              ...prev.data,
              [wrapper.fixed_question_id]: parsed,
            },
          }));
        } catch {
          // JSON 파싱 실패 시 무시
        }
      },
      (err: Error) => {
        if (isCancelled) return;
        setState((prev) => ({ ...prev, error: err, status: 'error' }));
        isRequestingRef.current = false;
        // 에러 시에는 재시도할 수 있도록 requestedSurveyUuidRef 초기화
        requestedSurveyUuidRef.current = null;
      },
      () => {
        setState((prev) => ({ ...prev, status: 'complete' }));
        isRequestingRef.current = false;
        // 성공 완료 시에는 requestedSurveyUuidRef 유지 (중복 요청 방지)
      }
    ).then((cleanup) => {
      cleanupFn = cleanup;
    });

    return () => {
      isCancelled = true;
      cleanupFn?.();
      isRequestingRef.current = false;
      // 언마운트 시에는 requestedSurveyUuidRef는 유지 (리마운트 시 중복 요청 방지)
    };
  }, [surveyUuid, enabled]);

  return {
    data: state.data,
    questionIds: Object.keys(state.data).map(Number),
    isLoading,
    isError,
    error: state.error,
    isComplete,
  };
}

export { useQuestionAnalysis };
