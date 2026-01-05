import { useState } from 'react';
import { useParams } from 'react-router-dom';

import { Spinner } from '@/components/ui/loading';
import {
  QuestionAnalysisTabs,
  QuestionAnalysisView,
  SurveyOverview,
  SurveyResultsTable,
  type Tab,
  useSurveyResults,
} from '@/features/survey-analytics';

/**
 * 설문 분석 결과 페이지
 * URL: /survey/analytics/:gameId
 */
function SurveyAnalyticsPage() {
  const { gameId } = useParams<{ gameId: string }>();
  const [activeTab, setActiveTab] = useState<Tab>('overview');

  const { summary, list, isLoading, isError } = useSurveyResults({
    gameId: gameId || '',
  });

  // MVP: surveyId 임시 고정 (나중에 list[0]?.surveyId 또는 URL param으로 변경)
  const surveyId = list[0]?.surveyId || 100;

  return (
    <main className="container mx-auto max-w-7xl px-4 py-8">
      {isLoading && (
        <div className="flex flex-col items-center justify-center gap-2 py-12">
          <Spinner size="lg" />
          <span className="text-muted-foreground">데이터를 불러오는 중...</span>
        </div>
      )}

      {isError && (
        <div className="py-12 text-center text-destructive">
          데이터를 불러오는 중 오류가 발생했습니다.
        </div>
      )}

      {!isLoading && !isError && summary && (
        <>
          {/* 탭 네비게이션 */}
          <div className="mb-6">
            <QuestionAnalysisTabs
              activeTab={activeTab}
              onTabChange={setActiveTab}
            />
          </div>

          {/* 설문 개요 탭 */}
          {activeTab === 'overview' && (
            <SurveyOverview summary={summary} surveyId={surveyId} />
          )}

          {/* 질문별 분석 탭 */}
          {activeTab === 'questions' && Boolean(surveyId) && (
            <QuestionAnalysisView surveyId={surveyId} />
          )}

          {activeTab === 'questions' && surveyId === 0 && (
            <div className="py-12 text-center text-muted-foreground">
              분석할 설문 데이터가 없습니다.
            </div>
          )}

          {/* 세부 데이터 탭 */}
          {activeTab === 'details' && (
            <SurveyResultsTable data={list} />
          )}
        </>
      )}
    </main>
  );
}

export default SurveyAnalyticsPage;
