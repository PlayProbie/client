/**
 * Game Detail Query Hook
 * use[Entity][Action]Query 네이밍 컨벤션
 */
import { useQuery } from '@tanstack/react-query';

import { getGame } from '../api';
import type { Game } from '../types';
import { gameKeys } from './useGamesQuery';

/** Query Config */
const STALE_TIME_DEFAULT = 1000 * 60 * 5; // 5분

export interface UseGameDetailQueryOptions {
  enabled?: boolean;
}

/** 게임 상세 조회 Hook */
export function useGameDetailQuery(
  gameUuid: string,
  options?: UseGameDetailQueryOptions
) {
  return useQuery<Game>({
    queryKey: gameKeys.detail(gameUuid),
    queryFn: () => getGame(gameUuid),
    staleTime: STALE_TIME_DEFAULT,
    enabled: (options?.enabled ?? true) && !!gameUuid,
  });
}
