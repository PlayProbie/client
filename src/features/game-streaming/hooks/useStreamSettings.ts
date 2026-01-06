/**
 * Stream Settings Query/Mutation Hooks
 */
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { useToast } from '@/hooks/useToast';

import { getStreamSettings, putStreamSettings } from '../api';
import { QUERY_CONFIG } from '../constants';
import type { StreamSettings } from '../types';

/** Query Keys */
export const streamSettingsKeys = {
  all: ['stream-settings'] as const,
  details: () => [...streamSettingsKeys.all, 'detail'] as const,
  detail: (gameUuid: string) =>
    [...streamSettingsKeys.details(), gameUuid] as const,
};

/** 스트림 설정 조회 Hook */
export function useStreamSettingsQuery(gameUuid: string) {
  return useQuery<StreamSettings>({
    queryKey: streamSettingsKeys.detail(gameUuid),
    queryFn: () => getStreamSettings(gameUuid),
    enabled: !!gameUuid,
    staleTime: QUERY_CONFIG.STALE_TIME_DEFAULT,
  });
}

/** 스트림 설정 저장 Hook */
export function useStreamSettingsMutation(gameUuid: string) {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (settings: StreamSettings) =>
      putStreamSettings(gameUuid, settings),
    onSuccess: (data) => {
      queryClient.setQueryData(streamSettingsKeys.detail(gameUuid), data);
      toast({
        variant: 'success',
        title: '스트리밍 설정이 저장되었습니다.',
      });
    },
  });
}
