import { useMutation, useQueryClient } from '@tanstack/react-query';

import type { CreateVersionRequest, Version } from '../types';
import { versionKeys } from './useVersionsQuery';

// Mock mutation function (TODO: 실제 API로 교체)
async function createVersion(
  gameUuid: string,
  data: CreateVersionRequest
): Promise<Version> {
  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 500));

  // Return mock created version
  return {
    versionUuid: `ver-${Date.now()}`,
    gameUuid,
    versionName: data.versionName,
    description: data.description || '',
    status: data.status || 'beta',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

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
