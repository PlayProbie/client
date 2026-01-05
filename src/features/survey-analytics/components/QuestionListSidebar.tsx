import { ScrollArea } from '@/components/ui/ScrollArea';

import type { QuestionAnalysisResult } from '../types';

type QuestionListSidebarProps = {
  readonly questions: Record<number, QuestionAnalysisResult>;
  readonly questionIds: number[];
  readonly selectedQuestionId: number | null;
  readonly onSelectQuestion: (questionId: number) => void;
};

/**
 * 질문 목록 사이드바
 * 이미지 왼쪽의 질문 리스트 형태
 */
function QuestionListSidebar({
  questions,
  questionIds,
  selectedQuestionId,
  onSelectQuestion,
}: QuestionListSidebarProps) {
  const getSentimentBarColor = (score: number) => {
    if (score >= 60) return 'bg-success';
    if (score >= 40) return 'bg-warning';
    return 'bg-destructive';
  };

  const getSentimentTextColor = (score: number) => {
    if (score >= 60) return 'text-success';
    if (score >= 40) return 'text-warning';
    return 'text-destructive';
  };

  return (
    <aside className="w-64 shrink-0 rounded-lg border bg-card shadow-sm">
      <div className="flex items-center justify-between border-b p-4">
        <h3 className="text-sm font-semibold text-foreground">질문 리스트</h3>
        <span className="rounded-full bg-primary px-2 py-0.5 text-xs font-medium text-primary-foreground">
          {questionIds.length}
        </span>
      </div>
      
      <ScrollArea className="h-[calc(100vh-280px)]">
        <div className="space-y-1 p-2">
          {questionIds.map((questionId, index) => {
            const question = questions[questionId];
            const isSelected = selectedQuestionId === questionId;

            return (
              <button
                key={questionId}
                onClick={() => onSelectQuestion(questionId)}
                className={`group w-full rounded-lg border px-3 py-2.5 text-left transition-all ${
                  isSelected
                    ? 'border-primary bg-primary/5'
                    : 'border-transparent hover:border-border hover:bg-muted/50'
                }`}
              >
                <div className="mb-1 flex items-center gap-2">
                  <div className={`flex h-6 w-6 items-center justify-center rounded text-xs font-bold ${
                    isSelected 
                      ? 'bg-primary text-primary-foreground' 
                      : 'bg-muted text-muted-foreground group-hover:bg-secondary'
                  }`}>
                    Q{index + 1}
                  </div>
                  <span className={`text-xs ${
                    isSelected ? 'font-semibold text-primary' : 'text-muted-foreground'
                  }`}>
                    응답 {question.total_answers}개
                  </span>
                </div>
                
                <p className={`line-clamp-2 text-sm leading-snug ${
                  isSelected ? 'font-medium text-foreground' : 'text-foreground/80'
                }`}>
                  질문 {index + 1}
                </p>
                
                {question.sentiment && (
                  <div className="mt-2 flex items-center gap-1.5">
                    <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-muted">
                      <div
                        className={`h-full ${getSentimentBarColor(question.sentiment.score)}`}
                        style={{ width: `${question.sentiment.score}%` }}
                      />
                    </div>
                    <span className={`text-xs font-semibold ${getSentimentTextColor(question.sentiment.score)}`}>
                      {question.sentiment.score}
                    </span>
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </ScrollArea>
    </aside>
  );
}

export { QuestionListSidebar };
