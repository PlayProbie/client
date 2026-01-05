/**
 * 관리자 테스트 관련 훅
 */
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { streamingResourceKeys } from '@/features/game-streaming-survey';

import { getResourceStatus, startTest, stopTest } from '../api';
import type { AdminTestResult, ResourceStatus } from '../types';

/** Query Key Factory */
export const adminTestKeys = {
  all: ['adminTest'] as const,
  status: (surveyId: number) =>
    [...adminTestKeys.all, 'status', surveyId] as const,
};

/** 리소스 상태 조회 훅 (TESTING 중 폴링) */
export function useResourceStatus(surveyId: number, enabled = true) {
  return useQuery<ResourceStatus, Error>({
    queryKey: adminTestKeys.status(surveyId),
    queryFn: () => getResourceStatus(surveyId),
    enabled,
    refetchInterval: (query) => {
      // TESTING 상태일 때 3초마다 폴링 (instances_ready 확인)
      const data = query.state.data;
      if (data?.status === 'TESTING' && !data.instancesReady) {
        return 3000;
      }
      return false;
    },
  });
}

/** 테스트 시작 훅 */
export function useStartTest(surveyId: number) {
  const queryClient = useQueryClient();

  return useMutation<AdminTestResult, Error>({
    mutationFn: () => startTest(surveyId),
    onSuccess: () => {
      // 상태 쿼리 및 스트리밍 리소스 쿼리 무효화
      queryClient.invalidateQueries({
        queryKey: adminTestKeys.status(surveyId),
      });
      queryClient.invalidateQueries({
        queryKey: streamingResourceKeys.detail(surveyId),
      });
    },
  });
}

/** 테스트 종료 훅 */
export function useStopTest(surveyId: number) {
  const queryClient = useQueryClient();

  return useMutation<AdminTestResult, Error>({
    mutationFn: () => stopTest(surveyId),
    onSuccess: () => {
      // 상태 쿼리 및 스트리밍 리소스 쿼리 무효화
      queryClient.invalidateQueries({
        queryKey: adminTestKeys.status(surveyId),
      });
      queryClient.invalidateQueries({
        queryKey: streamingResourceKeys.detail(surveyId),
      });
    },
  });
}
