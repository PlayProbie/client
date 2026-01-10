/**
 * useProvisioningPolling - 프로비저닝 상태 폴링 훅
 * 전역 스토어와 연동하여 프로비저닝 상태를 추적
 */
import { useQuery } from '@tanstack/react-query';
import { useEffect, useRef } from 'react';

import {
  ProvisioningStatus,
  useProvisioningStore,
} from '@/stores/useProvisioningStore';

import { getStreamingResource } from '../api';
import type { StreamingResourceStatus } from '../types';
import { streamingResourceKeys } from './useStreamingResource';

interface UseProvisioningPollingParams {
  surveyUuid: string;
  /** 프로비저닝 스토어 항목 ID */
  itemId: string | null;
  /** 폴링 활성화 여부 */
  enabled: boolean;
  /** ACTIVE 도달 시 콜백 */
  onSuccess?: () => void;
}

/**
 * StreamingResourceStatus → ProvisioningStatus 변환
 * UI에 표시되지 않는 중간 상태들을 적절히 매핑
 */
function mapToProvisioningStatus(
  status: StreamingResourceStatus
): ProvisioningStatus {
  switch (status) {
    case 'CREATING':
      return ProvisioningStatus.CREATING;
    case 'PENDING':
    case 'PROVISIONING':
    case 'TESTING':
    case 'SCALING':
      return ProvisioningStatus.PROVISIONING;
    case 'READY':
      return ProvisioningStatus.READY;
    case 'ACTIVE':
      return ProvisioningStatus.ACTIVE;
    case 'CLEANING':
      return ProvisioningStatus.READY;
    case 'TERMINATED':
    default:
      return ProvisioningStatus.ERROR;
  }
}

/**
 * 프로비저닝 상태를 폴링하고 전역 스토어를 업데이트합니다.
 */
export function useProvisioningPolling({
  surveyUuid,
  itemId,
  enabled,
  onSuccess,
}: UseProvisioningPollingParams) {
  const updateStatus = useProvisioningStore((state) => state.updateStatus);
  const setError = useProvisioningStore((state) => state.setError);

  const hasNotifiedRef = useRef(false);

  const { data, isError, error, refetch } = useQuery({
    queryKey: streamingResourceKeys.detail(surveyUuid),
    queryFn: () => getStreamingResource(surveyUuid),
    enabled: enabled && !!itemId,
    refetchInterval: (query) => {
      const status = query.state.data?.status;
      // READY 또는 ACTIVE 상태가 되면 polling 중지
      if (!enabled || status === 'READY' || status === 'ACTIVE') {
        return false;
      }
      return 5000; // 5초 간격
    },
  });

  // 상태 변경 감지 및 스토어 업데이트
  useEffect(() => {
    if (!itemId || !enabled) return;

    if (isError && error) {
      const message =
        error instanceof Error
          ? error.message
          : '리소스 상태 조회에 실패했습니다.';
      setError(itemId, message);
      return;
    }

    if (data?.status) {
      // StreamingResourceStatus → ProvisioningStatus 변환
      const mappedStatus = mapToProvisioningStatus(data.status);
      updateStatus(itemId, mappedStatus);

      // READY 또는 ACTIVE 도달 시 콜백 호출 (한 번만)
      if (
        (data.status === 'READY' || data.status === 'ACTIVE') &&
        !hasNotifiedRef.current
      ) {
        hasNotifiedRef.current = true;
        onSuccess?.();
      }
    }
  }, [
    data?.status,
    isError,
    error,
    itemId,
    enabled,
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
