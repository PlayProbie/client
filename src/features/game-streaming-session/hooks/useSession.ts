/**
 * 세션 가용성 훅
 */
import { useQuery } from '@tanstack/react-query';

import { getSession } from '../api';
import type { SessionInfo } from '../types';

/** Query Key Factory */
export const sessionKeys = {
  all: ['sessions'] as const,
  detail: (surveyUuid: string) => [...sessionKeys.all, surveyUuid] as const,
  status: (surveyUuid: string) =>
    [...sessionKeys.all, surveyUuid, 'status'] as const,
};

/** 세션 가용성 조회 훅 (테스터 진입 시) */
export function useSessionInfo(surveyUuid: string, enabled = true) {
  return useQuery<SessionInfo, Error>({
    queryKey: sessionKeys.detail(surveyUuid),
    queryFn: () => getSession(surveyUuid),
    enabled,
    // staleTime: 1000, // 10초
  });
}
