/**
 * 설문 목록 조회 훅
 */
import { useQuery } from '@tanstack/react-query';

import { getSurveys } from '../api';
import type { Survey } from '../types';

/** Query Key Factory */
export const surveyKeys = {
  all: ['surveys'] as const,
  list: (gameId?: number) => [...surveyKeys.all, 'list', { gameId }] as const,
};

interface UseSurveysOptions {
  gameId?: number;
  enabled?: boolean;
}

/** 설문 목록 조회 훅 */
export function useSurveys(options: UseSurveysOptions = {}) {
  const { gameId, enabled = true } = options;

  return useQuery<Survey[], Error>({
    queryKey: surveyKeys.list(gameId),
    queryFn: () => getSurveys({ gameId }),
    enabled,
  });
}
