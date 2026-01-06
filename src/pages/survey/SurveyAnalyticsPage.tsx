import { useParams } from 'react-router-dom';

import { Spinner } from '@/components/ui/loading';
import {
  SurveyResultsSummaryCard,
  SurveyResultsTable,
  useSurveyResults,
} from '@/features/survey-analytics';

/**
 * 설문 분석 결과 페이지
 * URL: /survey/analytics/:gameUuid
 */
function SurveyAnalyticsPage() {
  const { gameUuid } = useParams<{ gameUuid: string }>();

  const { summary, list, isLoading, isError } = useSurveyResults({
    gameUuid: gameUuid || '',
  });

  return (
    <main className="container mx-auto max-w-5xl px-4 py-8">
      {isLoading && (
        <div className="flex flex-col items-center justify-center gap-2 py-12">
          <Spinner size="lg" />
          <span className="text-muted-foreground">데이터를 불러오는 중...</span>
        </div>
      )}

      {isError && (
        <div className="text-destructive py-12 text-center">
          데이터를 불러오는 중 오류가 발생했습니다.
        </div>
      )}

      {!isLoading && !isError && summary && (
        <>
          <SurveyResultsSummaryCard data={summary} />
          <SurveyResultsTable data={list} />
        </>
      )}
    </main>
  );
}

export default SurveyAnalyticsPage;
