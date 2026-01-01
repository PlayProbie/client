import type { SurveyResultsSummary } from '../types';

type SurveyResultsSummaryCardProps = {
  data: SurveyResultsSummary;
};

/**
 * 설문 응답 요약 정보 표시 컴포넌트
 * - 설문 개수 (survey_count)
 * - 응답 개수 (response_count)
 */
function SurveyResultsSummaryCard({ data }: SurveyResultsSummaryCardProps) {
  return (
    <div className="mb-6 grid grid-cols-2 gap-4">
      <div className="bg-card rounded-lg border p-4">
        <p className="text-muted-foreground text-sm">설문 수</p>
        <p className="text-2xl font-bold">{data.survey_count}</p>
      </div>
      <div className="bg-card rounded-lg border p-4">
        <p className="text-muted-foreground text-sm">총 응답 수</p>
        <p className="text-2xl font-bold">{data.response_count}</p>
      </div>
    </div>
  );
}

export { SurveyResultsSummaryCard };
