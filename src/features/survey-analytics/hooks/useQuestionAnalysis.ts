import { useEffect, useRef, useState } from 'react';

import { getQuestionAnalysis } from '../api';
import type {
  AnalysisFilters,
  QuestionAnalysisResult,
  QuestionResponseAnalysisWrapper,
} from '../types';

type UseQuestionAnalysisOptions = {
  surveyUuid: string | null;
  filters?: AnalysisFilters;
  enabled?: boolean;
};

type QuestionAnalysisState = {
  [questionId: number]: QuestionAnalysisResult;
};

/**
 * 설문 질문별 AI 분석 결과 페칭 훅 (SSE)
 */
export function useQuestionAnalysis({
  surveyUuid,
  filters,
  enabled = true,
}: UseQuestionAnalysisOptions) {
  // 단일 객체 상태로 통합
  const [state, setState] = useState({
    data: {} as QuestionAnalysisState,
    error: null as Error | null,
    status: 'idle' as 'idle' | 'loading' | 'complete' | 'error',
    totalParticipants: 0,
    surveySummary: '' as string,
  });

  // ref를 사용해 중복 요청 방지 (React StrictMode 대응)
  const requestedSurveyUuidRef = useRef<string | null>(null);
  const lastFilterKeyRef = useRef<string>('{}');
  const isRequestingRef = useRef(false);

  // Derived state (계산된 값)
  const isLoading = state.status === 'loading';
  const isError = state.status === 'error';
  const isComplete = state.status === 'complete';

  // Refetch control
  const [refetchCount, setRefetchCount] = useState(0);

  const refetch = () => {
    // Reset requesting ref to allow new request
    requestedSurveyUuidRef.current = null;
    setRefetchCount((c) => c + 1);
  };

  useEffect(() => {
    if (!surveyUuid || !enabled) {
      return;
    }

    // 필터 직렬화하여 비교 (변경 감지용)
    const currentFilterKey = JSON.stringify(filters ?? {});

    // 이미 요청 중이면 스킵
    if (isRequestingRef.current) {
      return;
    }

    // 같은 surveyUuid로 완료된 요청이 있으면 스킵
    // 단, refetchCount가 변경되거나 필터가 변경되면 재요청 허용
    if (
      surveyUuid === requestedSurveyUuidRef.current &&
      refetchCount === 0 &&
      currentFilterKey === lastFilterKeyRef.current
    ) {
      return;
    }

    requestedSurveyUuidRef.current = surveyUuid;
    lastFilterKeyRef.current = currentFilterKey;
    isRequestingRef.current = true;

    // eslint-disable-next-line react-hooks/set-state-in-effect
    setState({ data: {}, error: null, status: 'loading', totalParticipants: 0, surveySummary: '' });

    let cleanupFn: (() => void) | null = null;
    let isCancelled = false;

    getQuestionAnalysis(
      surveyUuid,
      filters,
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
      (totalParticipants: number, surveySummary?: string) => {
        setState((prev) => ({ ...prev, status: 'complete', totalParticipants, surveySummary: surveySummary || '' }));
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
  }, [
    surveyUuid,
    enabled,
    refetchCount,
    filters?.gender,
    filters?.ageGroup,
    filters?.preferGenre,
  ]);

  return {
    data: state.data,
    questionIds: Object.keys(state.data).map(Number),
    refetch,
    isLoading,
    isError,
    error: state.error,
    isComplete,
    totalParticipants: state.totalParticipants,
    surveySummary: state.surveySummary,
  };
}


