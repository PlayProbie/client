import { useQuery } from '@tanstack/react-query';

import { getSurveyResultsList } from '../api/get-survey-results-list';
import { getSurveyResultsSummary } from '../api/get-survey-results-summary';
import type { ApiSurveyResultListItem, SurveyResultsList, SurveyResultsSummary } from '../types';

type UseSurveyResultsOptions = {
  surveyUuid: string;
};

/**
 * 설문 결과 데이터 페칭 훅
 * - 요약 정보 + 리스트 데이터 조회
 */
function useSurveyResults({ surveyUuid }: UseSurveyResultsOptions) {
  const summaryQuery = useQuery({
    queryKey: ['survey-results-summary', surveyUuid],
    queryFn: () => getSurveyResultsSummary({ surveyUuid }),
    select: (response): SurveyResultsSummary => ({
      surveyCount: response.result.survey_count,
      responseCount: response.result.response_count,
    }),
    enabled: !!surveyUuid,
  });

  const listQuery = useQuery({
    queryKey: ['survey-results-list', surveyUuid],
    queryFn: async () => {
      let allContent: ApiSurveyResultListItem[] = [];
      let cursor: string | undefined = undefined;
      let hasNext = true;

      while (hasNext) {
        const response = await getSurveyResultsList({
           surveyUuid, 
           limit: 100, // Fetch more items per request to reduce roundtrips
           cursor 
        });
        
        // ESLint: Variable name must match camelCase
        const { content, next_cursor: nextCursorResponse, has_next: hasNextResponse } = response.result;
        allContent = [...allContent, ...content];
        
        hasNext = hasNextResponse;
        cursor = nextCursorResponse?.toString();
      }

      return {
        // Construct a synthetic response that looks like a single big page
        result: {
          content: allContent,
          next_cursor: null,
          has_next: false
        }
      };
    },
    select: (response): SurveyResultsList => ({
      content: response.result.content.map((item: ApiSurveyResultListItem) => ({
        sessionUuid: item.session_uuid,
        surveyName: item.survey_name,
        surveyUuid: item.survey_uuid,
        testerId: item.tester_id,
        status: item.status,
        endedAt: item.ended_at,
        gender: item.gender,
        ageGroup: item.age_group,
        preferGenre: item.prefer_genre,
      })),
      nextCursor: null,
      hasNext: false,
    }),
    enabled: !!surveyUuid,
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

