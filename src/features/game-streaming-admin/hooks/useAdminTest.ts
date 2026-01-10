/**
 * 관리자 테스트 관련 훅
 */
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import {
  streamingResourceKeys,
  StreamingResourceStatus,
} from '@/features/game-streaming-survey';

import { getResourceStatus, startTest, stopTest } from '../api';
import type { AdminTestResult, ResourceStatus } from '../types';

/** Query Key Factory */
export const adminTestKeys = {
  all: ['adminTest'] as const,
  status: (surveyUuid: string) =>
    [...adminTestKeys.all, 'status', surveyUuid] as const,
};

/** 리소스 상태 조회 훅 (TESTING 중 폴링) */
export function useResourceStatus(surveyUuid: string, enabled = true) {
  return useQuery<ResourceStatus, Error>({
    queryKey: adminTestKeys.status(surveyUuid),
    queryFn: () => getResourceStatus(surveyUuid),
    enabled,
    refetchInterval: (query) => {
      // TESTING 상태일 때 3초마다 폴링 (instances_ready 확인)
      const data = query.state.data;
      if (
        data?.status === StreamingResourceStatus.TESTING &&
        !data.instancesReady
      ) {
        return 3000;
      }
      return false;
    },
  });
}

/** 테스트 시작 훅 */
export function useStartTest(surveyUuid: string) {
  const queryClient = useQueryClient();

  return useMutation<AdminTestResult, Error>({
    mutationFn: () => startTest(surveyUuid),
    onSuccess: () => {
      // 상태 쿼리 및 스트리밍 리소스 쿼리 무효화
      queryClient.invalidateQueries({
        queryKey: adminTestKeys.status(surveyUuid),
      });
      queryClient.invalidateQueries({
        queryKey: streamingResourceKeys.detail(surveyUuid),
      });
    },
  });
}

/** 테스트 종료 훅 */
export function useStopTest(surveyUuid: string) {
  const queryClient = useQueryClient();

  return useMutation<AdminTestResult, Error>({
    mutationFn: () => stopTest(surveyUuid),
    onSuccess: () => {
      // 상태 쿼리 및 스트리밍 리소스 쿼리 무효화
      queryClient.invalidateQueries({
        queryKey: adminTestKeys.status(surveyUuid),
      });
      queryClient.invalidateQueries({
        queryKey: streamingResourceKeys.detail(surveyUuid),
      });
    },
  });
}
