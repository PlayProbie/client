/**
 * useProvisioningPolling - 프로비저닝 상태 폴링 훅
 * 전역 스토어와 연동하여 프로비저닝 상태를 추적
 */
import { useQuery } from '@tanstack/react-query';
import { useEffect, useRef } from 'react';

import {
  mapToProvisioningStatus,
  useProvisioningStore,
} from '@/stores/useProvisioningStore';

import { getStreamingResource } from '../api';
import { StreamingResourceStatus } from '../types';
import { streamingResourceKeys } from './useStreamingResource';

interface UseProvisioningPollingParams {
  surveyUuid: string;
  /** 프로비저닝 스토어 항목 ID */
  itemId: string | null;
  /** 폴링 활성화 여부 */
  enabled: boolean;
  /** 전역 스토어 동기화 여부 */
  syncStore?: boolean;
  /** ACTIVE 도달 시 콜백 */
  onSuccess?: () => void;
}

/**
 * 프로비저닝 상태를 폴링하고 전역 스토어를 업데이트합니다.
 */
export function useProvisioningPolling({
  surveyUuid,
  itemId,
  enabled,
  syncStore = true,
  onSuccess,
}: UseProvisioningPollingParams) {
  const updateStatus = useProvisioningStore((state) => state.updateStatus);
  const setError = useProvisioningStore((state) => state.setError);

  const hasNotifiedRef = useRef(false);

  const { data, isError, error, refetch } = useQuery({
    queryKey: streamingResourceKeys.detail(surveyUuid),
    queryFn: () => getStreamingResource(surveyUuid),
    enabled: enabled && !!itemId,
    refetchOnMount: 'always',
    refetchOnWindowFocus: true,
    refetchIntervalInBackground: true,
    refetchInterval: (query) => {
      const status = query.state.data?.status;
      // ACTIVE 상태가 되면 polling 중지
      if (!enabled || status === StreamingResourceStatus.ACTIVE) {
        return false;
      }
      return 5000; // 5초 간격
    },
  });

  // 상태 변경 감지 및 스토어 업데이트
  useEffect(() => {
    if (!itemId || !enabled) return;

    if (isError && error) {
      if (syncStore) {
        const message =
          error instanceof Error
            ? error.message
            : '리소스 상태 조회에 실패했습니다.';
        setError(itemId, message);
      }
      return;
    }

    if (!data?.status) return;

    const mappedStatus = mapToProvisioningStatus(data.status);
    if (syncStore) {
      updateStatus(itemId, mappedStatus);
    }

    if (
      (data.status === StreamingResourceStatus.READY ||
        data.status === StreamingResourceStatus.ACTIVE) &&
      !hasNotifiedRef.current
    ) {
      hasNotifiedRef.current = true;
      onSuccess?.();
    }
  }, [
    data?.status,
    isError,
    error,
    itemId,
    enabled,
    syncStore,
    updateStatus,
    setError,
    onSuccess,
  ]);

  // enabled가 false가 되면 ref 리셋
  useEffect(() => {
    if (!enabled) {
      hasNotifiedRef.current = false;
    }
  }, [enabled]);

  return {
    data,
    isError,
    error,
    refetch,
  };
}
