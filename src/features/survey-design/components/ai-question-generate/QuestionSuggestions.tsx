import { Lightbulb } from 'lucide-react';

import { Button } from '@/components/ui';

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
            <Button
              key={sugIdx}
              type="button"
              variant="outline"
              onClick={() => onSuggestionClick(questionIndex, suggestion)}
              disabled={disabled}
              className="h-auto justify-start px-3 py-2 text-left whitespace-normal"
            >
              {suggestion}
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
}

export { QuestionSuggestions };
export type { QuestionSuggestionsProps };
