import { Header } from '@/components/layout/Header';
import {
  SurveyResultsSummaryCard,
  SurveyResultsTable,
  useSurveyResults,
} from '@/features/survey-response';

/**
 * 설문 응답 결과 페이지
 * URL: /survey/response
 */
function SurveyResponsePage() {
  // TODO: gameId를 URL 파라미터 또는 상태에서 가져오기
  const gameId = 'demo-game-id';

  const { summary, list, isLoading, isError } = useSurveyResults({ gameId });

  return (
    <div className="bg-background min-h-screen">
      <Header />
      <main className="container mx-auto max-w-5xl px-4 py-8">
        <h1 className="mb-8 text-2xl font-bold">설문 응답 결과</h1>

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
    </div>
  );
}

export default SurveyResponsePage;
