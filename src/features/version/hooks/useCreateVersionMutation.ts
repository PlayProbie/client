import { useMutation, useQueryClient } from '@tanstack/react-query';

import { createVersion } from '../api';
import type { CreateVersionRequest } from '../types';
import { versionKeys } from './keys';

interface UseCreateVersionMutationOptions {
  gameUuid: string;
}

/**
 * 버전 생성 Mutation Hook
 */
export function useCreateVersionMutation({ gameUuid }: UseCreateVersionMutationOptions) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateVersionRequest) => createVersion(gameUuid, data),
    onSuccess: () => {
      // 버전 목록 캐시 무효화
      queryClient.invalidateQueries({
        queryKey: versionKeys.byGame(gameUuid),
      });
    },
  });
}
