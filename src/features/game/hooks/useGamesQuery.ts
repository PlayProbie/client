/**
 * Games Query Hook
 * use[Entity][Action]Query 네이밍 컨벤션
 */
import { useQuery } from '@tanstack/react-query';

import { getGames } from '../api';
import type { Game } from '../types';

// 임시 기본 워크스페이스 UUID (실제 워크스페이스 구현 시 변경)
const DEFAULT_WORKSPACE_UUID = '550e8400-e29b-41d4-a716-446655440000';

/** Query Keys */
export const gameKeys = {
  all: ['games'] as const,
  lists: () => [...gameKeys.all, 'list'] as const,
  list: (workspaceUuid: string) =>
    [...gameKeys.lists(), workspaceUuid] as const,
  details: () => [...gameKeys.all, 'detail'] as const,
  detail: (gameUuid: string) => [...gameKeys.details(), gameUuid] as const,
};

/** Query Config */
const STALE_TIME_DEFAULT = 1000 * 60 * 5; // 5분

export interface UseGamesQueryOptions {
  workspaceUuid?: string;
  enabled?: boolean;
}

/** 게임 목록 조회 Hook */
export function useGamesQuery(options?: UseGamesQueryOptions) {
  const workspaceUuid = options?.workspaceUuid ?? DEFAULT_WORKSPACE_UUID;

  return useQuery<Game[]>({
    queryKey: gameKeys.list(workspaceUuid),
    queryFn: () => getGames(workspaceUuid),
    staleTime: STALE_TIME_DEFAULT,
    enabled: options?.enabled ?? true,
  });
}
