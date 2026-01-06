/**
 * 설문 목록 조회 훅
 */
import { useQuery } from '@tanstack/react-query';

import { getSurveys } from '../api';
import type { Survey } from '../types';

/** Query Key Factory */
export const surveyKeys = {
  all: ['surveys'] as const,
  list: (gameUuid?: string) =>
    [...surveyKeys.all, 'list', { gameUuid }] as const,
};

interface UseSurveysOptions {
  gameUuid?: string;
  enabled?: boolean;
}

/** 설문 목록 조회 훅 */
export function useSurveys(options: UseSurveysOptions = {}) {
  const { gameUuid, enabled = true } = options;

  return useQuery<Survey[], Error>({
    queryKey: surveyKeys.list(gameUuid),
    queryFn: () => getSurveys({ gameUuid }),
    enabled,
  });
}
