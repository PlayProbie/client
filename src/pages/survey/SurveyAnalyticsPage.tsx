import { useParams } from 'react-router-dom';

import {
  SurveyResultsSummaryCard,
  SurveyResultsTable,
  useSurveyResults,
} from '@/features/survey-analytics';

/**
 * 설문 분석 결과 페이지
 * URL: /survey/analytics/:gameId
 */
function SurveyAnalyticsPage() {
  const { gameId } = useParams<{ gameId: string }>();

  const { summary, list, isLoading, isError } = useSurveyResults({
    gameId: gameId || '',
  });

  return (
    <main className="container mx-auto max-w-5xl px-4 py-8">
      {isLoading && (
        <div className="text-muted-foreground py-12 text-center">
          데이터를 불러오는 중...
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
