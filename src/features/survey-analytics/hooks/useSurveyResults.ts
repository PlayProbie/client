import { useQuery } from '@tanstack/react-query';

import { getSurveyResultsList } from '../api/get-survey-results-list';
import { getSurveyResultsSummary } from '../api/get-survey-results-summary';
import type { SurveyResultsList, SurveyResultsSummary } from '../types';

type UseSurveyResultsOptions = {
  gameUuid: string;
};

/**
 * 설문 결과 데이터 페칭 훅
 * - 요약 정보 + 리스트 데이터 조회
 */
function useSurveyResults({ gameUuid }: UseSurveyResultsOptions) {
  const summaryQuery = useQuery({
    queryKey: ['survey-results-summary', gameUuid],
    queryFn: () => getSurveyResultsSummary({ gameUuid }),
    select: (response): SurveyResultsSummary => ({
      surveyCount: response.result.survey_count,
      responseCount: response.result.response_count,
    }),
    enabled: !!gameUuid,
  });

  const listQuery = useQuery({
    queryKey: ['survey-results-list', gameUuid],
    queryFn: () => getSurveyResultsList({ gameUuid }),
    select: (response): SurveyResultsList => ({
      content: response.result.content.map((item) => ({
        sessionUuid: item.session_uuid,
        surveyName: item.survey_name,
        surveyUuid: item.survey_uuid,
        testerId: item.tester_id,
        status: item.status,
        endedAt: item.ended_at,
        firstQuestion: item.first_question,
      })),
      nextCursor: response.result.next_cursor,
      hasNext: response.result.has_next,
    }),
    enabled: !!gameUuid,
  });

  return {
    summary: summaryQuery.data,
    list: listQuery.data?.content ?? [],
    isLoading: summaryQuery.isLoading || listQuery.isLoading,
    isError: summaryQuery.isError || listQuery.isError,
    error: summaryQuery.error ?? listQuery.error,
  };
}

export { useSurveyResults };
