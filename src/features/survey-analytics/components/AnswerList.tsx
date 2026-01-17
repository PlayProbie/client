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
          <MessageSquareText className="h-5 w-5 text-muted-foreground" />
          <CardTitle className="text-base">{title}</CardTitle>
        </div>
        <span className="text-xs text-muted-foreground">총 {answers.length}개</span>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {answers.map((answer, index) => {
          const qaPairs = parseQAPairs(answer.text);
          const firstPair = qaPairs[0];
          const tailPairs = qaPairs.slice(1);
          const hasTail = tailPairs.length > 0;
          const itemId = `answer-${answer.id || index}`;

          const FixedContent = (
            <div className={`relative w-full rounded-lg border p-4 text-left transition-colors ${hasTail ? 'group-hover:bg-muted/50' : 'bg-muted/10'}`}>
              <div className="mb-2 flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-0.5 text-xs font-semibold rounded ${
                    firstPair.type === 'FIXED' 
                      ? 'bg-primary/10 text-primary' 
                      : 'bg-accent/10 text-accent-foreground'
                  }`}>
                    {firstPair.type === 'FIXED' ? '고정 질문' : '꼬리 질문'}
                  </span>
                  {hasTail && (
                    <span className="text-xs text-muted-foreground flex items-center gap-0.5">
                      <MessageSquareText className="h-3 w-3" />
                      꼬리질문 {tailPairs.length}개
                    </span>
                  )}
                </div>
                {answer.sentiment && (
                  <Badge 
                    variant="outline"
                    className={`shrink-0 ${getSentimentStyle(answer.sentiment)}`}
                  >
                    {getSentimentLabel(answer.sentiment)}
                  </Badge>
                )}
              </div>
              
              <div className="space-y-1">
                <p className="text-xs font-medium text-muted-foreground">
                  {firstPair.question}
                </p>
                <p className="text-sm leading-relaxed text-foreground font-medium">
                  {firstPair.answer}
                </p>
              </div>

              {answer.tags && answer.tags.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-1">
                  {answer.tags.map((tag) => (
                    <Badge key={tag} variant="secondary" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>
              )}
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
                  <div className="mt-2 ml-4 space-y-3 border-l-2 border-muted pl-4">
                    {tailPairs.map((pair, idx) => (
                      <div 
                        key={idx} 
                        className="rounded-lg border bg-muted/30 p-3"
                      >
                        <div className="mb-2 flex items-center gap-2">
                          <span className="bg-accent/10 text-accent-foreground rounded px-2 py-0.5 text-xs font-semibold">
                            꼬리 질문
                          </span>
                        </div>
                        <div className="space-y-1">
                          <p className="text-xs font-medium text-muted-foreground">
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
