/**
 * Schedule Query/Mutation Hooks
 */
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { useToast } from '@/hooks/useToast';

import { getSchedule, putSchedule, type ScheduleInput } from '../api';
import { QUERY_CONFIG } from '../constants';
import type { Schedule } from '../types';

/** Query Keys */
export const scheduleKeys = {
  all: ['schedule'] as const,
  details: () => [...scheduleKeys.all, 'detail'] as const,
  detail: (gameUuid: string) => [...scheduleKeys.details(), gameUuid] as const,
};

/** 스케줄 조회 Hook */
export function useScheduleQuery(gameUuid: string) {
  return useQuery<Schedule>({
    queryKey: scheduleKeys.detail(gameUuid),
    queryFn: () => getSchedule(gameUuid),
    enabled: !!gameUuid,
    staleTime: QUERY_CONFIG.STALE_TIME_DEFAULT,
  });
}

/** 스케줄 저장 Hook */
export function useScheduleMutation(gameUuid: string) {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (schedule: ScheduleInput) => putSchedule(gameUuid, schedule),
    onSuccess: (data) => {
      queryClient.setQueryData(scheduleKeys.detail(gameUuid), data);
      toast({
        title: '저장 완료',
        description: '스케줄이 저장되었습니다.',
      });
    },
    onError: () => {
      toast({
        title: '저장 실패',
        description: '스케줄 저장에 실패했습니다. 다시 시도해주세요.',
        variant: 'destructive',
      });
    },
  });
}
