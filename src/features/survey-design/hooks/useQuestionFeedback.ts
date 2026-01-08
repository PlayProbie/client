/**
 * 질문 피드백 관리 훅
 * - 피드백 API 요청 (useMutation 사용)
 * - 피드백 캐싱
 * - 로딩 상태 관리
 */

import { useMutation } from '@tanstack/react-query';
import { useCallback, useState } from 'react';

import { postQuestionFeedback } from '../api';
import { useSurveyFormStore } from '../store/useSurveyFormStore';
import type { QuestionFeedbackItem } from '../types';

/** 재시도 횟수 */
const RETRY_COUNT = 3;

/**
 * useQuestionFeedback - 질문 피드백 관리
 */
function useQuestionFeedback() {
  const { formData } = useSurveyFormStore();

  // 질문별 피드백 (메모리에서만 관리 - API 응답 캐시)
  const [feedbackMap, setFeedbackMap] = useState<
    Record<string, QuestionFeedbackItem>
  >({});

  // 현재 로딩 중인 질문 인덱스
  const [loadingIndex, setLoadingIndex] = useState<number | null>(null);

  // 피드백 요청 mutation
  const { mutateAsync, isPending } = useMutation({
    mutationFn: async (question: string): Promise<QuestionFeedbackItem> => {
      const {
        gameName,
        gameGenre,
        gameContext,
        surveyName,
        themePriorities,
        themeDetails,
      } = formData;

      const response = await postQuestionFeedback({
        game_name: gameName || '',
        game_context: gameContext || '',
        game_genre: gameGenre || [],
        survey_name: surveyName || '',
        theme_priorities: themePriorities || [],
        theme_details: themeDetails,
        questions: [question],
      });

      // API는 단일 객체로 반환
      const feedback = response.result;

      return {
        question,
        aiFeedback: feedback.ai_feedback || '',
        suggestions: feedback.suggestions || [],
      };
    },
    retry: RETRY_COUNT,
  });

  // 특정 질문에 대한 피드백 요청
  const fetchFeedbackForQuestion = useCallback(
    async (question: string): Promise<QuestionFeedbackItem> => {
      return mutateAsync(question);
    },
    [mutateAsync]
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
    isFetchingFeedback: isPending,

    // 상태 설정자
    setFeedbackMap,
    setLoadingIndex,

    // 핸들러
    fetchFeedbackForQuestion,
    removeFeedback,
    addFeedback,
  };
}

export { useQuestionFeedback };
