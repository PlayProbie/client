/**
 * 질문 관리 통합 훅
 * - useQuestionSelection과 useQuestionFeedback을 조합
 * - useQuestionGenerate, useQuestionUserGenerate에서 공통 사용
 */

import { useCallback } from 'react';

import { useToast } from '@/hooks/useToast';

import { useQuestionFeedback } from './useQuestionFeedback';
import { useQuestionSelection } from './useQuestionSelection';

/**
 * useQuestionManager - 질문 관리 통합 훅
 * 선택 관리(useQuestionSelection)와 피드백 관리(useQuestionFeedback)를 조합
 */
function useQuestionManager() {
  // 질문 선택 관련 로직
  const selection = useQuestionSelection();

  // 피드백 관련 로직
  const feedback = useQuestionFeedback();

  const { toast } = useToast();

  // 특정 질문에 대한 피드백 요청 (질문 수정 시)
  const handleRequestFeedback = useCallback(
    async (index: number, newQuestion: string) => {
      feedback.setLoadingIndex(index);

      try {
        // 질문 업데이트 -> Store에 저장
        const newQuestions = selection.questions.map((q, idx) =>
          idx === index ? newQuestion : q
        );
        selection.setQuestions(newQuestions);

        // 피드백 요청
        const feedbackItem =
          await feedback.fetchFeedbackForQuestion(newQuestion);

        // 피드백 맵 업데이트
        feedback.addFeedback(newQuestion, feedbackItem);
      } catch {
        toast({
          variant: 'destructive',
          title: '피드백 요청 실패',
          description: '질문 피드백을 가져오는데 실패했습니다.',
        });
      } finally {
        feedback.setLoadingIndex(null);
      }
    },
    [selection, feedback, toast]
  );

  // 추천 대안 클릭 시 질문 텍스트만 변경 (API 재요청 없음)
  const handleSuggestionClick = useCallback(
    (questionIndex: number, suggestion: string) => {
      // 질문 텍스트만 교체
      const newQuestions = selection.questions.map((q, idx) =>
        idx === questionIndex ? suggestion : q
      );
      selection.setQuestions(newQuestions);
    },
    [selection]
  );

  // 질문 삭제 시 피드백도 함께 삭제
  const removeQuestionWithFeedback = useCallback(
    (index: number) => {
      const removedQuestion = selection.questions[index];
      selection.removeQuestion(index);

      // 피드백 맵에서도 삭제
      if (removedQuestion) {
        feedback.removeFeedback(removedQuestion);
      }
    },
    [selection, feedback]
  );

  return {
    // Selection 상태
    questions: selection.questions,
    selectedQuestions: selection.selectedQuestions,
    selectedCount: selection.selectedCount,
    totalCount: selection.totalCount,
    isAllSelected: selection.isAllSelected,
    validationError: selection.validationError,

    // Feedback 상태
    feedbackMap: feedback.feedbackMap,
    loadingIndex: feedback.loadingIndex,
    isFetchingFeedback: feedback.isFetchingFeedback,

    // Selection 설정자
    setQuestions: selection.setQuestions,
    setSelectedQuestions: selection.setSelectedQuestions,

    // Feedback 설정자
    setFeedbackMap: feedback.setFeedbackMap,

    // Selection 핸들러
    handleToggle: selection.handleToggle,
    handleSelectAll: selection.handleSelectAll,
    addQuestionAtFront: selection.addQuestionAtFront,
    removeQuestion: removeQuestionWithFeedback,

    // Feedback 핸들러
    handleRequestFeedback,
    handleSuggestionClick,
    fetchFeedbackForQuestion: feedback.fetchFeedbackForQuestion,
  };
}

export { useQuestionManager };
