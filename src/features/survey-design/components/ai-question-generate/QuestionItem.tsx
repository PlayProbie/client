import * as AccordionPrimitive from '@radix-ui/react-accordion';
import { ChevronDown } from 'lucide-react';

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

  const isDisabled = isLoading || isSubmitting;

  return (
    <AccordionPrimitive.Item
      value={`item-${index}`}
      className={cn(
        'rounded-lg border transition-colors',
        isSelected
          ? 'border-primary/30 bg-primary/5'
          : 'border-border bg-background hover:bg-muted/30',
        isDisabled && 'opacity-70'
      )}
    >
      {/* Question Header */}
      <AccordionPrimitive.Header className="flex">
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

          <AccordionPrimitive.Trigger className="text-muted-foreground hover:text-foreground flex items-center gap-1 text-xs transition-colors [&[data-state=open]>svg]:rotate-180">
            <span>대안</span>
            <ChevronDown className="size-4 transition-transform duration-200" />
          </AccordionPrimitive.Trigger>
        </div>
      </AccordionPrimitive.Header>

      {/* AI Feedback */}
      <QuestionFeedback
        aiFeedback={feedback?.aiFeedback || ''}
        isFetchingFeedback={isFetchingFeedback}
        hasFeedback={!!feedback}
      />

      {/* Accordion Content - Suggestions */}
      <AccordionPrimitive.Content className="data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down overflow-hidden text-sm">
        <div className="border-border border-t px-4 pt-4 pb-4">
          <QuestionSuggestions
            suggestions={feedback?.suggestions || []}
            questionIndex={index}
            onSuggestionClick={onSuggestionClick}
            disabled={isDisabled}
          />
        </div>
      </AccordionPrimitive.Content>
    </AccordionPrimitive.Item>
  );
}

export { QuestionItem };
export type { QuestionItemProps };
