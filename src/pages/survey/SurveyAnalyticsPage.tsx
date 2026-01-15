import { useState } from 'react';
import { useParams } from 'react-router-dom';

import { Spinner } from '@/components/ui/loading';
import {
  AnalysisFilterBar,
  QuestionAnalysisTabs,
  QuestionAnalysisView,
  SurveyOverview,
  SurveyResultsTable,
  type AnalysisFilters,
  type Tab,
  useAnalyticsSubscription,
  useQuestionAnalysis,
  useSurveyResults,
} from '@/features/survey-analytics';

/**
 * 설문 분석 결과 페이지
 * URL: /survey/analytics/:surveyUuid
 */
function SurveyAnalyticsPage() {
  const { surveyUuid } = useParams<{
    surveyUuid: string;
  }>();
  const [activeTab, setActiveTab] = useState<Tab>('overview');
  const [filters, setFilters] = useState<AnalysisFilters>({
    gender: null,
    ageGroup: null,
    preferGenre: null,
  });

  const { summary, list, isLoading, isError } = useSurveyResults({
    surveyUuid: surveyUuid || '',
  });

  const effectiveSurveyUuid = surveyUuid || null;

  // 1. 필터 적용 데이터 (질문별 분석용)
  const {
    data: filteredData,
    questionIds: filteredIds,
    refetch: refetchFiltered,
    isLoading: isFilteredLoading,
    isError: isFilteredError,
    totalParticipants: filteredTotalParticipants,
    surveySummary: filteredSummaryText,
  } = useQuestionAnalysis({
    surveyUuid: effectiveSurveyUuid,
    filters,
    enabled: !!effectiveSurveyUuid,
  });

  // 2. 전체 원본 데이터 (설문 개요용)
  const {
    data: unfilteredData,
    questionIds: unfilteredIds,
    refetch: refetchUnfiltered,
    isLoading: isUnfilteredLoading,
    isError: isUnfilteredError,
    totalParticipants: unfilteredTotalParticipants,
    surveySummary: unfilteredSurveySummary,
  } = useQuestionAnalysis({
    surveyUuid: effectiveSurveyUuid,
    filters: undefined, // 필터 없음
    enabled: !!effectiveSurveyUuid,
  });

  // SSE 구독 및 업데이트 시 리패치 트리거 (둘 다 갱신)
  useAnalyticsSubscription(effectiveSurveyUuid, () => {
    refetchFiltered();
    refetchUnfiltered();
  });

  // 필터 데이터 객체
  const filteredQuestionAnalysis = {
    data: filteredData,
    questionIds: filteredIds,
    isLoading: isFilteredLoading,
    isError: isFilteredError,
    totalParticipants: filteredTotalParticipants,
    surveySummary: filteredSummaryText,
  };

  // 원본 데이터 객체 (설문 개요용)
  const unfilteredQuestionAnalysis = {
    data: unfilteredData,
    questionIds: unfilteredIds,
    isLoading: isUnfilteredLoading,
    isError: isUnfilteredError,
    totalParticipants: unfilteredTotalParticipants,
    surveySummary: unfilteredSurveySummary,
  };

  // 전체 로딩 상태 (기본 설문 정보 로딩 포함)
  const isPageLoading = isLoading || isFilteredLoading || isUnfilteredLoading;
  // 전체 에러 상태 (기본 설문 정보 에러 포함)
  const isPageError = isError || isFilteredError || isUnfilteredError;

  return (
    <main className="container mx-auto max-w-7xl px-4 py-8">
      {isPageLoading && (
        <div className="flex flex-col items-center justify-center gap-2 py-12">
          <Spinner size="lg" />
          <span className="text-muted-foreground">데이터를 불러오는 중...</span>
        </div>
      )}

      {isPageError && (
        <div className="py-12 text-center text-destructive">
          데이터를 불러오는 중 오류가 발생했습니다.
        </div>
      )}

      {!isPageLoading && !isPageError && summary && (
        <>
          {/* 탭 네비게이션 */}
          <div className="mb-6">
            <QuestionAnalysisTabs
              activeTab={activeTab}
              onTabChange={setActiveTab}
            />
            {/* 필터 바 (Questions 탭에서만 표시) */}
            {activeTab === 'questions' && (
              <div className="mt-4">
                <AnalysisFilterBar
                  filters={filters}
                  onApplyFilters={setFilters}
                  isLoading={isFilteredLoading}
                />
              </div>
            )}
          </div>

          {/* 설문 개요 탭 (전체 데이터 - Unfiltered) */}
          {activeTab === 'overview' && Boolean(surveyUuid) && (
            <SurveyOverview
              summary={summary}
              questionAnalysis={unfilteredQuestionAnalysis}
            />
          )}

          {/* 질문별 분석 탭 (필터 데이터 - Filtered) */}
          {activeTab === 'questions' && Boolean(surveyUuid) && (
            <QuestionAnalysisView
              questionAnalysis={filteredQuestionAnalysis}
            />
          )}

          {activeTab === 'questions' && !surveyUuid && (
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

