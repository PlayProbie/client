/**
 * 세션 상태 훅 (Heartbeat)
 */
import { useQuery } from '@tanstack/react-query';

import { getSessionStatus } from '../api';
import { HEARTBEAT_INTERVAL } from '../constants';
import type { SessionStatus } from '../types';
import { sessionKeys } from './useSession';

/** 세션 상태 조회 훅 (Heartbeat 폴링) */
export function useSessionStatus(
  surveyUuid: string,
  surveySessionUuid?: string,
  enabled = true
) {
  return useQuery<SessionStatus, Error>({
    queryKey: [...sessionKeys.status(surveyUuid), surveySessionUuid],
    queryFn: () => getSessionStatus(surveyUuid, surveySessionUuid),
    enabled,
    refetchInterval: HEARTBEAT_INTERVAL, // 1분 간격 폴링
    staleTime: HEARTBEAT_INTERVAL - 5000, // 55초
  });
}
