import { useCallback, useEffect, useState } from 'react';

type UseQuestionEditOptions = {
  question: string;
  onSubmit: (editedQuestion: string) => Promise<void>;
};

type UseQuestionEditReturn = {
  isEditing: boolean;
  editedQuestion: string;
  isSubmitting: boolean;
  setEditedQuestion: (value: string) => void;
  handleStartEdit: (e: React.MouseEvent) => void;
  handleCancelEdit: (e: React.MouseEvent) => void;
  handleSubmitEdit: (e: React.MouseEvent) => Promise<void>;
};

/**
 * 질문 편집 상태 관리 훅
 * - 편집 모드 토글
 * - 수정된 질문 상태 관리
 * - 제출 로딩 상태 관리
 */
function useQuestionEdit({
  question,
  onSubmit,
}: UseQuestionEditOptions): UseQuestionEditReturn {
  const [isEditing, setIsEditing] = useState(false);
  const [editedQuestion, setEditedQuestion] = useState(question);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // question prop이 변경되면 editedQuestion 동기화
  useEffect(() => {
    setEditedQuestion(question);
  }, [question]);

  const handleStartEdit = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      setIsEditing(true);
      setEditedQuestion(question);
    },
    [question]
  );

  const handleCancelEdit = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      setIsEditing(false);
      setEditedQuestion(question);
    },
    [question]
  );

  const handleSubmitEdit = useCallback(
    async (e: React.MouseEvent) => {
      e.stopPropagation();
      if (!editedQuestion.trim() || editedQuestion === question) {
        setIsEditing(false);
        return;
      }

      setIsSubmitting(true);
      try {
        await onSubmit(editedQuestion);
        setIsEditing(false);
      } finally {
        setIsSubmitting(false);
      }
    },
    [editedQuestion, question, onSubmit]
  );

  return {
    isEditing,
    editedQuestion,
    isSubmitting,
    setEditedQuestion,
    handleStartEdit,
    handleCancelEdit,
    handleSubmitEdit,
  };
}

export { useQuestionEdit };
export type { UseQuestionEditOptions, UseQuestionEditReturn };
