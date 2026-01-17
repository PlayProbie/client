import { ChevronDown, Sparkles } from 'lucide-react';
import { useState } from 'react';

import { Button } from '@/components/ui';
import { Checkbox } from '@/components/ui/Checkbox';
import { cn } from '@/lib/utils';

import { useQuestionEdit } from '../../hooks/useQuestionEdit';
import type { QuestionFeedbackItem } from '../../types';
import { QuestionEditForm } from './QuestionEditForm';
import { QuestionFeedback } from './QuestionFeedback';
import { QuestionLabel } from './QuestionLabel';
import { QuestionSuggestions } from './QuestionSuggestions';

type QuestionItemProps = {
  index: number;
  question: string;
  isSelected: boolean;
  isLoading: boolean;
  isFetchingFeedback: boolean;
  feedback: QuestionFeedbackItem | undefined;
  onToggle: (index: number) => void;
  onSuggestionClick: (index: number, suggestion: string) => void;
  onRequestFeedback: (index: number, question: string) => Promise<void>;
};

/**
 * 개별 질문 아이템 (아코디언)
 * - 체크박스 + 질문 텍스트 (수정 모드 토글)
 * - AI 피드백 (header 바로 아래)
 * - 추천 대안 (아코디언 펼침 시)
 */
function QuestionItem({
  index,
  question,
  isSelected,
  isLoading,
  isFetchingFeedback,
  feedback,
  onToggle,
  onSuggestionClick,
  onRequestFeedback,
}: QuestionItemProps) {
  const {
    isEditing,
    editedQuestion,
    isSubmitting,
    setEditedQuestion,
    handleStartEdit,
    handleCancelEdit,
    handleSubmitEdit,
  } = useQuestionEdit({
    question,
    onSubmit: (edited) => onRequestFeedback(index, edited),
  });

  const [isOpen, setIsOpen] = useState(false);

  // 피드백 토글 (열기/닫기 + 없으면 요청)
  const handleFeedbackToggle = async () => {
    // 닫혀있으면 -> 연다 (없으면 요청)
    if (!isOpen) {
      setIsOpen(true);
      if (!feedback) {
        await onRequestFeedback(index, question);
      }
    } else {
      // 열려있으면 -> 닫는다
      setIsOpen(false);
    }
  };

  // 대안 선택 시 (질문 변경 + 닫기)
  const handleSuggestionSelect = (idx: number, suggestion: string) => {
    onSuggestionClick(idx, suggestion);
    setIsOpen(false);
  };

  const isDisabled = isLoading || isSubmitting;

  return (
    <div
      className={cn(
        'rounded-lg border transition-colors',
        isSelected
          ? 'border-primary/30 bg-primary/5'
          : 'border-border bg-background hover:bg-muted/30',
        isDisabled && 'opacity-70'
      )}
    >
      {/* Question Header */}
      <div className="flex flex-1 items-center gap-3 px-4 py-4">
        <Checkbox
          id={`question-${index}`}
          checked={isSelected}
          onCheckedChange={() => onToggle(index)}
          disabled={isDisabled}
          onClick={(e) => e.stopPropagation()}
        />

        {/* Label or Edit Input */}
        {isEditing ? (
          <QuestionEditForm
            editedQuestion={editedQuestion}
            isSubmitting={isSubmitting}
            onChangeQuestion={setEditedQuestion}
            onSubmit={handleSubmitEdit}
            onCancel={handleCancelEdit}
          />
        ) : (
          <QuestionLabel
            index={index}
            question={question}
            isSubmitting={isSubmitting}
            isDisabled={isDisabled}
            onStartEdit={handleStartEdit}
          />
        )}

        {/* Feedback Toggle Button */}
        <Button
          variant="ghost"
          size="sm"
          className={cn(
            'ml-auto gap-1 text-xs h-7 px-2',
            isOpen ? 'text-primary' : 'text-muted-foreground'
          )}
          onClick={handleFeedbackToggle}
          disabled={isDisabled}
        >
          <Sparkles className="size-3.5" />
          <span>피드백</span>
          <ChevronDown
            className={cn(
              'size-3.5 transition-transform duration-200',
              isOpen && 'rotate-180'
            )}
          />
        </Button>
      </div>

      {/* Feedback & Suggestions Area (Expanded) */}
      {isOpen && (
        <div className="border-border border-t animate-accordion-down overflow-hidden text-sm">
          {/* AI Feedback */}
          <QuestionFeedback
            aiFeedback={feedback?.aiFeedback || ''}
            isFetchingFeedback={isFetchingFeedback}
            hasFeedback={!!feedback}
          />

          {/* Suggestions */}
          {(feedback?.suggestions?.length ?? 0) > 0 && (
            <div className="border-border border-t px-4 pt-4 pb-4">
              <QuestionSuggestions
                suggestions={feedback?.suggestions || []}
                questionIndex={index}
                onSuggestionClick={handleSuggestionSelect}
                disabled={isDisabled}
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export { QuestionItem };
export type { QuestionItemProps };
