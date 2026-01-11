/**
 * ProvisioningPollingProvider - 전역 프로비저닝 상태 폴링 유지
 * 라우트 전환과 무관하게 활성 항목을 계속 폴링합니다.
 */
import { useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';

import {
  getStreamingResource,
  streamingResourceKeys,
} from '@/features/game-streaming-survey';
import {
  mapToProvisioningStatus,
  type ProvisioningItem,
  ProvisioningStatus,
  useProvisioningStore,
} from '@/stores/useProvisioningStore';

const POLLING_INTERVAL_MS = 5000;

export function ProvisioningPollingProvider() {
  const queryClient = useQueryClient();
  const updateStatus = useProvisioningStore((state) => state.updateStatus);
  const setError = useProvisioningStore((state) => state.setError);

  useEffect(() => {
    let isActive = true;

    const pollOnce = async () => {
      const { items } = useProvisioningStore.getState();
      const activeItems = items.filter(
        (item) =>
          item.status === ProvisioningStatus.CREATING ||
          item.status === ProvisioningStatus.PROVISIONING
      );

      if (activeItems.length === 0) return;

      await Promise.all(
        activeItems.map(async (item: ProvisioningItem) => {
          try {
            const data = await getStreamingResource(item.surveyUuid);
            queryClient.setQueryData(
              streamingResourceKeys.detail(item.surveyUuid),
              data
            );

            if (!data?.status) return;
            const mappedStatus = mapToProvisioningStatus(data.status);
            updateStatus(item.id, mappedStatus);
          } catch (error) {
            if (!isActive) return;
            const message =
              error instanceof Error
                ? error.message
                : '리소스 상태 조회에 실패했습니다.';
            setError(item.id, message);
          }
        })
      );
    };

    void pollOnce();
    const intervalId = window.setInterval(() => {
      void pollOnce();
    }, POLLING_INTERVAL_MS);

    return () => {
      isActive = false;
      window.clearInterval(intervalId);
    };
  }, [queryClient, updateStatus, setError]);

  return null;
}
