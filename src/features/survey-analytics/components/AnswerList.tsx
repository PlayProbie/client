import { MessageSquareText } from 'lucide-react';

import { Badge } from '@/components/ui/Badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';

type AnswerListItem = {
  id: string;
  text: string;
  tags?: string[];
  sentiment?: 'positive' | 'neutral' | 'negative';
};

type AnswerListProps = {
  readonly answers: AnswerListItem[];
  readonly title?: string;
};

/**
 * 필터링된 원문 리스트
 * 이미지 하단의 "필터링된 원문 리스트" 영역
 */
function AnswerList({ answers, title = '필터링된 원문 리스트' }: AnswerListProps) {
  const getSentimentStyle = (sentiment: 'positive' | 'neutral' | 'negative') => {
    if (sentiment === 'positive') return 'bg-success/10 text-success border-success/20';
    if (sentiment === 'negative') return 'bg-destructive/10 text-destructive border-destructive/20';
    return 'bg-muted text-muted-foreground border-border';
  };

  const getSentimentLabel = (sentiment: 'positive' | 'neutral' | 'negative') => {
    if (sentiment === 'positive') return '긍정';
    if (sentiment === 'negative') return '부정';
    return '중립';
  };

  if (!answers || answers.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base">{title}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">표시할 응답이 없습니다.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between space-y-0 pb-4">
        <div className="flex items-center gap-2">
          <MessageSquareText className="h-5 w-5 text-muted-foreground" />
          <CardTitle className="text-base">{title}</CardTitle>
        </div>
        <span className="text-xs text-muted-foreground">총 {answers.length}개</span>
      </CardHeader>
      
      <CardContent className="space-y-3">
        {answers.map((answer, index) => (
          <div 
            key={answer.id || index}
            className="rounded-lg border bg-muted/30 p-4 transition-all hover:bg-muted/50"
          >
            <div className="mb-2 flex items-start justify-between gap-3">
              <p className="flex-1 text-sm leading-relaxed text-foreground">
                {answer.text}
              </p>
              {answer.sentiment && (
                <Badge 
                  variant="outline" 
                  className={`shrink-0 ${getSentimentStyle(answer.sentiment)}`}
                >
                  {getSentimentLabel(answer.sentiment)}
                </Badge>
              )}
            </div>
            
            {answer.tags && answer.tags.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {answer.tags.map((tag) => (
                  <Badge 
                    key={tag}
                    variant="secondary"
                    className="text-xs"
                  >
                    {tag}
                  </Badge>
                ))}
              </div>
            )}
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

export { AnswerList };
export type { AnswerListItem };
