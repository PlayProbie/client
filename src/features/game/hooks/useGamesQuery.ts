/**
 * Games Query Hook
 * use[Entity][Action]Query 네이밍 컨벤션
 */
import { useQuery } from '@tanstack/react-query';

import { useCurrentWorkspaceStore } from '@/stores/useCurrentWorkspaceStore';

import { getGames } from '../api';
import type { Game } from '../types';

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
  return useQuery<Game[]>({
    queryKey: gameKeys.lists(),
    queryFn: () => getGames(),
    staleTime: STALE_TIME_DEFAULT,
    enabled: options?.enabled ?? true,
  });
}
