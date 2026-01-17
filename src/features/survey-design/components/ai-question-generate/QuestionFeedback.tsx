import { Spinner } from '@/components/ui/loading';

type QuestionFeedbackProps = {
  aiFeedback: string;
  isFetchingFeedback: boolean;
  hasFeedback: boolean;
};

/**
 * AI 피드백 요약 표시
 * - 피드백 로딩 중 또는 피드백 내용 표시
 */
function QuestionFeedback({
  aiFeedback,
  isFetchingFeedback,
  hasFeedback,
}: QuestionFeedbackProps) {
  // 피드백 로딩 중
  if (isFetchingFeedback && !hasFeedback) {
    return (
      <div className="border-border flex items-center gap-2 border-t px-4 py-3">
        <Spinner size="sm" />
        <span className="text-muted-foreground text-sm">피드백 로딩 중...</span>
      </div>
    );
  }

  // 피드백이 있는 경우
  if (hasFeedback) {
    return (
      <div className="border-border border-t px-4 py-3">
        <p className="text-muted-foreground text-start text-sm">
          <span className="text-primary font-medium">AI: </span>
          {aiFeedback}
        </p>
      </div>
    );
  }

  return null;
}

export { QuestionFeedback };
export type { QuestionFeedbackProps };
