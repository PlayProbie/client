/**
 * 세션 상태 훅 (Heartbeat)
 */
import { useQuery } from '@tanstack/react-query';
import { useEffect, useRef } from 'react';

import { getSessionStatus } from '../../api';
import { HEARTBEAT_INTERVAL } from '../../constants';
import type { SessionStatus } from '../../types';
import { sessionKeys } from './useSession';

/** useSessionStatus 옵션 */
interface UseSessionStatusOptions {
  enabled?: boolean;
  onSessionExpired?: () => void;
}

/** 세션 상태 조회 훅 (Heartbeat 폴링) */
export function useSessionStatus(
  surveyUuid: string,
  surveySessionUuid?: string,
  options: UseSessionStatusOptions = {}
) {
  const { enabled = true, onSessionExpired } = options;
  const wasActiveRef = useRef(true);
  const onSessionExpiredRef = useRef(onSessionExpired);

  // 콜백 레퍼런스 최신 상태 유지 (effect 내에서만 ref 업데이트)
  useEffect(() => {
    onSessionExpiredRef.current = onSessionExpired;
  }, [onSessionExpired]);

  const query = useQuery<SessionStatus, Error>({
    queryKey: [...sessionKeys.status(surveyUuid), surveySessionUuid],
    queryFn: () => getSessionStatus(surveyUuid, surveySessionUuid),
    enabled,
    refetchInterval: HEARTBEAT_INTERVAL, // 30초 간격 폴링
    staleTime: HEARTBEAT_INTERVAL - 5000, // 25초
  });

  // 세션 상태 변화 감지 및 콜백 호출
  const isActive = query.data?.isActive;
  useEffect(() => {
    if (wasActiveRef.current && isActive === false) {
      onSessionExpiredRef.current?.();
    }
    if (isActive !== undefined) {
      wasActiveRef.current = isActive;
    }
  }, [isActive]);

  return query;
}
