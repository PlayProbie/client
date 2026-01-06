import { useEffect, useRef, useState } from 'react';

import { getQuestionAnalysis } from '../api';
import type {
  QuestionAnalysisResult,
  QuestionResponseAnalysisWrapper,
} from '../types';

type UseQuestionAnalysisOptions = {
  surveyId: number | null;
  enabled?: boolean;
};

type QuestionAnalysisState = {
  [questionId: number]: QuestionAnalysisResult;
};

/**
 * 설문 질문별 AI 분석 결과 페칭 훅 (SSE)
 */
function useQuestionAnalysis({
  surveyId,
  enabled = true,
}: UseQuestionAnalysisOptions) {
  const [data, setData] = useState<QuestionAnalysisState>({});
  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [isComplete, setIsComplete] = useState(false);

  // ref를 사용해 중복 요청 방지 (React StrictMode 대응)
  const requestedSurveyIdRef = useRef<number | null>(null);
  const isRequestingRef = useRef(false);

  useEffect(() => {
    if (!surveyId || !enabled) {
      return;
    }

    // 이미 요청 중이거나 같은 surveyId로 완료된 요청이 있으면 스킵
    if (isRequestingRef.current || surveyId === requestedSurveyIdRef.current) {
      return;
    }

    requestedSurveyIdRef.current = surveyId;
    isRequestingRef.current = true;

    setIsLoading(true);
    setIsError(false);
    setError(null);
    setIsComplete(false);
    setData({});

    let cleanupFn: (() => void) | null = null;
    let isCancelled = false;

    getQuestionAnalysis(
      surveyId,
      (wrapper: QuestionResponseAnalysisWrapper) => {
        if (isCancelled) return;
        try {
          const parsed: QuestionAnalysisResult = JSON.parse(
            wrapper.resultJson
          );
          setData((prev) => ({
            ...prev,
            [wrapper.fixedQuestionId]: parsed,
          }));
        } catch (err) {
          console.error('Failed to parse question analysis result:', err);
        }
      },
      (err: Error) => {
        if (isCancelled) return;
        setIsError(true);
        setError(err);
        setIsLoading(false);
        isRequestingRef.current = false;
        // 에러 시에는 재시도할 수 있도록 requestedSurveyIdRef 초기화
        requestedSurveyIdRef.current = null;
      },
      () => {
        if (isCancelled) return;
        setIsLoading(false);
        setIsComplete(true);
        isRequestingRef.current = false;
        // 성공 완료 시에는 requestedSurveyIdRef 유지 (중복 요청 방지)
      }
    ).then((cleanup) => {
      cleanupFn = cleanup;
    });

    return () => {
      isCancelled = true;
      cleanupFn?.();
      isRequestingRef.current = false;
      // 언마운트 시에는 requestedSurveyIdRef는 유지 (리마운트 시 중복 요청 방지)
    };
  }, [surveyId, enabled]);

  return {
    data,
    questionIds: Object.keys(data).map(Number),
    isLoading,
    isError,
    error,
    isComplete,
  };
}

export { useQuestionAnalysis };
