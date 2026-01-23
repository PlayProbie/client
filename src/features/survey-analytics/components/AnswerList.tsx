import { MessageSquareText } from 'lucide-react';

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/Accordion';
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

type QaPair = {
  question: string;
  answer: string;
  type: 'FIXED' | 'TAIL';
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

  const parseQAPairs = (text: string): QaPair[] => {
    const pairs: QaPair[] = [];
    const regex = /Q:\s*([\s\S]*?)\s*A:\s*([\s\S]*?)(?=\s*Q:|$)/g;
    
    let match;
    while ((match = regex.exec(text)) !== null) {
      // 답변에서 [꼬리질문 N] 형식의 태그 제거 및 공백 정리
      const rawAnswer = match[2];
      const cleanAnswer = rawAnswer.replace(/\[꼬리질문\s*\d+\]/g, '').trim();

      pairs.push({
        question: match[1].trim(),
        answer: cleanAnswer,
        type: pairs.length === 0 ? 'FIXED' : 'TAIL',
      });
    }

    if (pairs.length === 0) {
      pairs.push({
        question: '질문',
        answer: text,
        type: 'FIXED',
      });
    }

    return pairs;
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
          <MessageSquareText className="h-5 w-5 text-primary" />
          <CardTitle className="text-base font-semibold">{title}</CardTitle>
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        {answers.map((answer, index) => {
          const qaPairs = parseQAPairs(answer.text);
          const firstPair = qaPairs[0];
          const tailPairs = qaPairs.slice(1);
          const hasTail = tailPairs.length > 0;
          const itemId = `answer-${answer.id || index}`;

          const FixedContent = (
            <div className={`relative w-full rounded-lg border border-border bg-surface p-5 text-left transition-all hover:shadow-md ${hasTail ? 'group-hover:border-primary/30' : ''}`}>
              <div className="mb-3 flex items-center justify-between gap-3">
                <div className="flex flex-wrap items-center gap-2">
                  {answer.tags && answer.tags.length > 0 ? (
                    answer.tags.map((tag) => (
                      <Badge
                        key={tag}
                        variant="secondary"
                        className="rounded-md bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary hover:bg-primary/20"
                      >
                        {tag}
                      </Badge>
                    ))
                  ) : (
                    <span className="text-xs text-muted-foreground">프로필 정보 없음</span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  {hasTail && (
                    <span className="flex items-center gap-1 text-xs text-muted-foreground">
                      <MessageSquareText className="h-3.5 w-3.5" />
                      {tailPairs.length}
                    </span>
                  )}
                  {answer.sentiment && (
                    <Badge
                      variant="outline"
                      className={`shrink-0 ${getSentimentStyle(answer.sentiment)}`}
                    >
                      {getSentimentLabel(answer.sentiment)}
                    </Badge>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <p className="text-xs font-medium text-muted-foreground leading-relaxed">
                  {firstPair.question}
                </p>
                <p className="text-sm leading-relaxed text-foreground font-normal">
                  {firstPair.answer}
                </p>
              </div>
            </div>
          );

          if (!hasTail) {
            return (
              <div key={itemId}>
                {FixedContent}
              </div>
            );
          }

          return (
            <Accordion
              key={itemId}
              type="single"
              collapsible
              className="w-full"
            >
              <AccordionItem value={itemId} className="border-none">
                <AccordionTrigger className="w-full py-0 hover:no-underline group">
                  {FixedContent}
                </AccordionTrigger>
                <AccordionContent>
                  <div className="mt-3 ml-6 space-y-3 border-l-2 border-primary/20 pl-4">
                    {tailPairs.map((pair, idx) => (
                      <div
                        key={idx}
                        className="rounded-lg border border-border bg-surface/50 p-4"
                      >
                        <div className="mb-2 flex items-center gap-2">
                          <span className="rounded-md bg-accent/10 px-2 py-1 text-xs font-medium text-accent">
                            꼬리 질문
                          </span>
                        </div>
                        <div className="space-y-2">
                          <p className="text-xs font-medium text-muted-foreground leading-relaxed">
                            {pair.question}
                          </p>
                          <p className="text-sm leading-relaxed text-foreground">
                            {pair.answer}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          );
        })}
      </CardContent>
    </Card>
  );
}

export { AnswerList };
export type { AnswerListItem };
