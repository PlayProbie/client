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
    select: (response) => response.result as unknown as SurveyResultsSummary,
    enabled: !!gameUuid,
  });

  const listQuery = useQuery({
    queryKey: ['survey-results-list', gameUuid],
    queryFn: () => getSurveyResultsList({ gameUuid }),
    select: (response) => response.result as unknown as SurveyResultsList,
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
