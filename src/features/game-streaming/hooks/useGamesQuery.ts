/**
 * Games 목록 Query Hook
 * use[Entity][Action]Query 네이밍 컨벤션
 */
import { useQuery } from '@tanstack/react-query';

import { getStreamingGameByUuid, getStreamingGames } from '../api';
import { QUERY_CONFIG } from '../constants';
import type { StreamingGame } from '../types';

/** Query Keys */
export const gameKeys = {
  all: ['games'] as const,
  lists: () => [...gameKeys.all, 'list'] as const,
  list: () => [...gameKeys.lists()] as const,
  details: () => [...gameKeys.all, 'detail'] as const,
  detail: (uuid: string) => [...gameKeys.details(), uuid] as const,
};

/** 게임 목록 조회 Hook */
export function useGamesQuery() {
  return useQuery<StreamingGame[]>({
    queryKey: gameKeys.list(),
    queryFn: getStreamingGames,
    staleTime: QUERY_CONFIG.STALE_TIME_DEFAULT,
  });
}

/** 게임 상세 조회 Hook */
export function useGameDetailQuery(
  gameUuid: string,
  options?: { enabled?: boolean }
) {
  return useQuery<StreamingGame | null>({
    queryKey: gameKeys.detail(gameUuid),
    queryFn: () => getStreamingGameByUuid(gameUuid),
    enabled: options?.enabled ?? !!gameUuid,
    staleTime: QUERY_CONFIG.STALE_TIME_DEFAULT,
  });
}
