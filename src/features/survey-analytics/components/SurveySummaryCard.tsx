import { Sparkles } from 'lucide-react';

import { Card, CardContent } from '@/components/ui/Card';

type SurveySummaryCardProps = {
  readonly summary: string;
};

/**
 * AI 종합 평가 카드
 * - 설문 전체에 대한 1~2문장 요약을 표시
 */
function SurveySummaryCard({ summary }: SurveySummaryCardProps) {
  if (!summary) return null;

  return (
    <Card className="border-primary/20 bg-gradient-to-r from-primary/5 to-primary/10">
      <CardContent className="flex items-start gap-4 py-4">
        <div className="rounded-lg bg-primary/10 p-3">
          <Sparkles className="h-6 w-6 text-primary" />
        </div>
        <div>
          <p className="mb-1 text-sm font-medium text-primary">AI 종합 평가</p>
          <p className="text-base leading-relaxed text-foreground">{summary}</p>
        </div>
      </CardContent>
    </Card>
  );
}

export { SurveySummaryCard };
