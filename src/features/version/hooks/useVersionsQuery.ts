import { useQuery } from '@tanstack/react-query';

import { getVersions } from '../api';
import type { Version } from '../types';

/** Version Query Keys */
export const versionKeys = {
  all: ['versions'] as const,
  byGame: (gameUuid: string) => [...versionKeys.all, 'game', gameUuid] as const,
  detail: (versionUuid: string) =>
    [...versionKeys.all, 'detail', versionUuid] as const,
};

interface UseVersionsOptions {
  gameUuid?: string;
  enabled?: boolean;
}

/**
 * 게임별 버전 목록 조회 훅
 */
export function useVersionsQuery(options: UseVersionsOptions = {}) {
  const { gameUuid, enabled = true } = options;

  return useQuery<Version[]>({
    queryKey: versionKeys.byGame(gameUuid ?? ''),
    queryFn: () => getVersions(gameUuid ?? ''),
    enabled: enabled && !!gameUuid,
  });
}
