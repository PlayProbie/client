import { useQuery } from '@tanstack/react-query';

import { getSurveyResultsList } from '../api/get-survey-results-list';
import { getSurveyResultsSummary } from '../api/get-survey-results-summary';

type UseSurveyResultsOptions = {
  gameId: string;
};

/**
 * 설문 결과 데이터 페칭 훅
 * - 요약 정보 + 리스트 데이터 조회
 */
function useSurveyResults({ gameId }: UseSurveyResultsOptions) {
  const summaryQuery = useQuery({
    queryKey: ['survey-results-summary', gameId],
    queryFn: () => getSurveyResultsSummary({ gameId }),
    enabled: !!gameId,
  });

  const listQuery = useQuery({
    queryKey: ['survey-results-list', gameId],
    queryFn: () => getSurveyResultsList({ gameId }),
    enabled: !!gameId,
  });

  return {
    summary: summaryQuery.data?.result,
    list: listQuery.data?.result.content ?? [],
    isLoading: summaryQuery.isLoading || listQuery.isLoading,
    isError: summaryQuery.isError || listQuery.isError,
    error: summaryQuery.error ?? listQuery.error,
  };
}

export { useSurveyResults };
