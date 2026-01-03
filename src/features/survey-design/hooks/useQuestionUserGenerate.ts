import { useCallback, useState } from 'react';

import { useToast } from '@/hooks/useToast';

import { useQuestionManager } from './useQuestionManager';

/**
 * 유저 질문 입력 및 피드백 관리 훅
 * - AI 질문 생성 API 호출 없이 유저가 직접 질문 입력
 * - useQuestionManager를 통해 공통 질문 관리 로직 재사용
 */
function useQuestionUserGenerate() {
  // 공통 질문 관리 로직
  const manager = useQuestionManager();
  const { toast } = useToast();

  // 새 질문 입력 상태
  const [newQuestion, setNewQuestion] = useState('');

  // 새 질문 추가
  const handleAddQuestion = useCallback(async () => {
    const trimmedQuestion = newQuestion.trim();
    if (!trimmedQuestion) return;

    manager.setIsFetchingFeedback(true);

    try {
      // 맨 앞에 추가 + 선택 인덱스 재조정
      manager.addQuestionAtFront(trimmedQuestion);

      // 피드백 요청
      const feedback = await manager.fetchFeedbackForQuestion(trimmedQuestion);
      manager.setFeedbackMap((prev) => ({
        ...prev,
        [trimmedQuestion]: feedback,
      }));

      // 입력창 초기화
      setNewQuestion('');
    } catch {
      toast({
        variant: 'destructive',
        title: '피드백 요청 실패',
        description: '질문 피드백을 가져오는데 실패했습니다.',
      });
    } finally {
      manager.setIsFetchingFeedback(false);
    }
  }, [newQuestion, manager, toast]);

  // 질문 삭제
  const handleRemoveQuestion = useCallback(
    (index: number) => {
      manager.removeQuestion(index);
    },
    [manager]
  );

  return {
    // 공통 상태 (from manager)
    questions: manager.questions,
    feedbackMap: manager.feedbackMap,
    selectedQuestions: manager.selectedQuestions,
    loadingIndex: manager.loadingIndex,
    isFetchingFeedback: manager.isFetchingFeedback,
    selectedCount: manager.selectedCount,
    totalCount: manager.totalCount,
    isAllSelected: manager.isAllSelected,
    validationError: manager.validationError,

    // 유저 입력 전용 상태
    newQuestion,
    setNewQuestion,

    // 공통 핸들러 (from manager)
    handleToggle: manager.handleToggle,
    handleSelectAll: manager.handleSelectAll,
    handleRequestFeedback: manager.handleRequestFeedback,
    handleSuggestionClick: manager.handleSuggestionClick,

    // 유저 입력 전용 핸들러
    handleAddQuestion,
    handleRemoveQuestion,
  };
}

export { useQuestionUserGenerate };
