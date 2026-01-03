import { Lightbulb } from 'lucide-react';

type QuestionSuggestionsProps = {
  suggestions: string[];
  questionIndex: number;
  onSuggestionClick: (index: number, suggestion: string) => void;
  disabled?: boolean;
};

/**
 * AI 추천 대안 목록
 */
function QuestionSuggestions({
  suggestions,
  questionIndex,
  onSuggestionClick,
  disabled = false,
}: QuestionSuggestionsProps) {
  if (suggestions.length === 0) {
    return (
      <p className="text-muted-foreground text-sm">
        추천 대안을 불러올 수 없습니다.
      </p>
    );
  }

  return (
    <div className="flex items-start gap-2">
      <Lightbulb className="mt-0.5 size-4 shrink-0 text-amber-500" />
      <div className="flex flex-1 flex-col gap-2">
        <span className="text-foreground text-xs font-medium">추천 대안</span>
        <div className="flex flex-col gap-1.5">
          {suggestions.map((suggestion, sugIdx) => (
            <button
              key={sugIdx}
              type="button"
              onClick={() => onSuggestionClick(questionIndex, suggestion)}
              disabled={disabled}
              className="bg-muted/50 hover:bg-muted hover:border-primary/50 text-muted-foreground hover:text-foreground border-border rounded-md border px-3 py-2 text-left text-sm transition-colors disabled:cursor-not-allowed disabled:opacity-50"
            >
              {suggestion}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

export { QuestionSuggestions };
export type { QuestionSuggestionsProps };
