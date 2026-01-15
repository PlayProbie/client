import { useQuery } from '@tanstack/react-query';

import { getVersions } from '../api';
import { getVersion } from '../api';
import type { Version } from '../types';
import { versionKeys } from './keys';


/**
 * 버전 상세 조회 훅
 */
export function useVersionDetailQuery(versionUuid: string) {
  return useQuery({
    queryKey: versionKeys.detail(versionUuid),
    queryFn: () => getVersion(versionUuid),
    enabled: !!versionUuid,
  });
}


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
