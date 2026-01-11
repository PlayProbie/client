import type { QuestionFeedbackItem } from '../../types';
import { QuestionItem } from './QuestionItem';

type QuestionListProps = {
  questions: string[];
  selectedQuestions: Set<number>;
  loadingIndex: number | null;
  isFetchingFeedback?: boolean;
  pendingFeedbackQuestions?: Set<string>;
  feedbackMap: Record<string, QuestionFeedbackItem>;
  onToggle: (index: number) => void;
  onSuggestionClick: (index: number, suggestion: string) => void;
  onRequestFeedback: (index: number, question: string) => Promise<void>;
};

/**
 * 질문 목록 (아코디언 컨테이너)
 */
function QuestionList({
  questions,
  selectedQuestions,
  loadingIndex,
  isFetchingFeedback,
  pendingFeedbackQuestions,
  feedbackMap,
  onToggle,
  onSuggestionClick,
  onRequestFeedback,
}: QuestionListProps) {


  return (
    <div className="flex flex-col gap-3">
      {questions.map((question, index) => (
        <QuestionItem
          key={question}
          index={index}
          question={question}
          isSelected={selectedQuestions.has(index)}
          isLoading={loadingIndex === index}
          isFetchingFeedback={
            pendingFeedbackQuestions?.has(question) ??
            Boolean(isFetchingFeedback)
          }
          feedback={feedbackMap[question]}
          onToggle={onToggle}
          onSuggestionClick={onSuggestionClick}
          onRequestFeedback={onRequestFeedback}
        />
      ))}
    </div>
  );
}

export { QuestionList };
export type { QuestionListProps };
