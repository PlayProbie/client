/**
 * 스트리밍 리소스 관련 훅
 */
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import {
  createStreamingResource,
  deleteStreamingResource,
  getStreamingResource,
} from '../api';
import {
  type CreateStreamingResourceRequest,
  type StreamingResource,
  StreamingResourceStatus,
} from '../types';

/** Query Key Factory */
export const streamingResourceKeys = {
  all: ['streamingResources'] as const,
  detail: (surveyUuid: string) =>
    [...streamingResourceKeys.all, surveyUuid] as const,
};

/** 스트리밍 리소스 조회 훅 */
export function useStreamingResource(surveyUuid: string, enabled = true) {
  return useQuery<StreamingResource | null, Error>({
    queryKey: streamingResourceKeys.detail(surveyUuid),
    queryFn: () => getStreamingResource(surveyUuid),
    enabled,
    refetchOnMount: 'always',
    refetchInterval: (query) => {
      // CREATING/PROVISIONING/READY 상태일 때 5초마다 폴링
      const data = query.state.data;
      if (
        data?.status === StreamingResourceStatus.CREATING ||
        data?.status === StreamingResourceStatus.PROVISIONING ||
        data?.status === StreamingResourceStatus.READY
      ) {
        return 5000;
      }
      return false;
    },
  });
}

/** 스트리밍 리소스 생성 훅 */
export function useCreateStreamingResource(surveyUuid: string) {
  const queryClient = useQueryClient();

  return useMutation<StreamingResource, Error, CreateStreamingResourceRequest>({
    mutationFn: (request) => createStreamingResource(surveyUuid, request),
    onSuccess: (data) => {
      queryClient.setQueryData(streamingResourceKeys.detail(surveyUuid), data);
    },
  });
}

/** 스트리밍 리소스 삭제 훅 */
export function useDeleteStreamingResource(surveyUuid: string) {
  const queryClient = useQueryClient();

  return useMutation<void, Error>({
    mutationFn: () => deleteStreamingResource(surveyUuid),
    onSuccess: () => {
      queryClient.setQueryData(streamingResourceKeys.detail(surveyUuid), null);
    },
  });
}
