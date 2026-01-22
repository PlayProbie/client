/**
 * 세션 종료 훅
 */
import { useMutation, useQueryClient } from '@tanstack/react-query';

import { postTerminate } from '../api';
import type { TerminateRequest, TerminateResponse } from '../types';
import { sessionKeys } from './useSession';

/** 세션 종료 훅 */
export function useTerminateSession(surveyUuid: string) {
  const queryClient = useQueryClient();

  return useMutation<TerminateResponse, Error, TerminateRequest>({
    mutationFn: (request) => postTerminate(surveyUuid, request),
    onSuccess: () => {
      // 세션 관련 쿼리 무효화
      queryClient.invalidateQueries({
        queryKey: sessionKeys.detail(surveyUuid),
      });
      queryClient.invalidateQueries({
        queryKey: sessionKeys.status(surveyUuid),
      });
    },
  });
}
