/**
 * 스트리밍 리소스 관련 훅
 */
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import {
  createStreamingResource,
  deleteStreamingResource,
  getStreamingResource,
} from '../api';
import type {
  CreateStreamingResourceRequest,
  StreamingResource,
} from '../types';

/** Query Key Factory */
export const streamingResourceKeys = {
  all: ['streamingResources'] as const,
  detail: (surveyId: number) =>
    [...streamingResourceKeys.all, surveyId] as const,
};

/** 스트리밍 리소스 조회 훅 */
export function useStreamingResource(surveyId: number, enabled = true) {
  return useQuery<StreamingResource | null, Error>({
    queryKey: streamingResourceKeys.detail(surveyId),
    queryFn: () => getStreamingResource(surveyId),
    enabled,
    refetchInterval: (query) => {
      // PROVISIONING 상태일 때 5초마다 폴링
      const data = query.state.data;
      if (data?.status === 'PROVISIONING') {
        return 5000;
      }
      return false;
    },
  });
}

/** 스트리밍 리소스 생성 훅 */
export function useCreateStreamingResource(surveyId: number) {
  const queryClient = useQueryClient();

  return useMutation<StreamingResource, Error, CreateStreamingResourceRequest>({
    mutationFn: (request) => createStreamingResource(surveyId, request),
    onSuccess: (data) => {
      queryClient.setQueryData(streamingResourceKeys.detail(surveyId), data);
    },
  });
}

/** 스트리밍 리소스 삭제 훅 */
export function useDeleteStreamingResource(surveyId: number) {
  const queryClient = useQueryClient();

  return useMutation<void, Error>({
    mutationFn: () => deleteStreamingResource(surveyId),
    onSuccess: () => {
      queryClient.setQueryData(streamingResourceKeys.detail(surveyId), null);
    },
  });
}
