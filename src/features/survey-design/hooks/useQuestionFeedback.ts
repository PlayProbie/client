/**
 * 질문 피드백 관리 훅
 * - 피드백 API 요청
 * - 피드백 캐싱
 * - 로딩 상태 관리
 */

import { useCallback, useState } from 'react';

import { postQuestionFeedback } from '../api';
import { useSurveyFormStore } from '../store/useSurveyFormStore';
import type { QuestionFeedbackItem } from '../types';

/**
 * useQuestionFeedback - 질문 피드백 관리
 */
function useQuestionFeedback() {
  const { formData } = useSurveyFormStore();

  // 질문별 피드백 (메모리에서만 관리 - API 응답 캐시)
  const [feedbackMap, setFeedbackMap] = useState<
    Record<string, QuestionFeedbackItem>
  >({});

  // 로딩 상태
  const [loadingIndex, setLoadingIndex] = useState<number | null>(null);
  const [isFetchingFeedback, setIsFetchingFeedback] = useState(false);

  // 특정 질문에 대한 피드백 요청
  const fetchFeedbackForQuestion = useCallback(
    async (question: string): Promise<QuestionFeedbackItem> => {
      const { gameName, gameGenre, gameContext, surveyName, testPurpose } =
        formData;

      const response = await postQuestionFeedback({
        game_name: gameName || '',
        game_context: gameContext || '',
        game_genre: gameGenre || [],
        survey_name: surveyName || '',
        test_purpose: testPurpose!,
        questions: [question],
      });

      // API는 배열로 반환하므로 첫 번째 항목 사용
      const feedback = response.result[0];

      return {
        question,
        summary: feedback?.summary || '',
        suggestions: feedback?.suggestions || [],
      };
    },
    [formData]
  );

  // 피드백 맵에서 특정 질문 삭제
  const removeFeedback = useCallback(
    (question: string) => {
      if (feedbackMap[question]) {
        setFeedbackMap((prev) => {
          const next = { ...prev };
          delete next[question];
          return next;
        });
      }
    },
    [feedbackMap]
  );

  // 피드백 추가/업데이트
  const addFeedback = useCallback(
    (question: string, feedback: QuestionFeedbackItem) => {
      setFeedbackMap((prev) => ({
        ...prev,
        [question]: feedback,
      }));
    },
    []
  );

  return {
    // 상태
    feedbackMap,
    loadingIndex,
    isFetchingFeedback,

    // 상태 설정자
    setFeedbackMap,
    setLoadingIndex,
    setIsFetchingFeedback,

    // 핸들러
    fetchFeedbackForQuestion,
    removeFeedback,
    addFeedback,
  };
}

export { useQuestionFeedback };
