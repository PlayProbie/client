import { useEffect, useState } from 'react';

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

  useEffect(() => {
    if (!surveyId || !enabled) {
      return;
    }

    // SSE 스트림 구독을 위한 상태 초기화 - 외부 시스템 동기화 패턴
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsLoading(true);
    setIsError(false);
    setError(null);
    setIsComplete(false);
    setData({});

    let cleanupFn: (() => void) | null = null;

    getQuestionAnalysis(
      surveyId,
      (wrapper: QuestionResponseAnalysisWrapper) => {
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
        setIsError(true);
        setError(err);
        setIsLoading(false);
      },
      () => {
        setIsLoading(false);
        setIsComplete(true);
      }
    ).then((cleanup) => {
      cleanupFn = cleanup;
    });

    return () => {
      cleanupFn?.();
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
