/**
 * Builds 목록 Query Hook
 */
import { useQuery } from '@tanstack/react-query';

import { getBuilds } from '../api';
import { QUERY_CONFIG } from '../constants';
import type { Build } from '../types';

/** Query Keys */
export const buildKeys = {
  all: ['builds'] as const,
  lists: () => [...buildKeys.all, 'list'] as const,
  list: (gameUuid: string) => [...buildKeys.lists(), gameUuid] as const,
};

/** 빌드 목록 조회 Hook */
export function useBuildsQuery(gameUuid: string) {
  return useQuery<Build[]>({
    queryKey: buildKeys.list(gameUuid),
    queryFn: () => getBuilds(gameUuid),
    enabled: !!gameUuid,
    staleTime: QUERY_CONFIG.STALE_TIME_SHORT,
  });
}
