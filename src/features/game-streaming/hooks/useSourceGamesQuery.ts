/**
 * Source Games Query Hook
 * Survey 시스템의 Game Entity 목록 조회
 */
import { useQuery } from '@tanstack/react-query';

import { getSourceGames } from '../api';
import { sourceGameKeys } from './useGameMutations';

/** 스트리밍 등록 가능한 Source Game 목록 조회 */
export function useSourceGamesQuery() {
  return useQuery({
    queryKey: sourceGameKeys.list(),
    queryFn: getSourceGames,
  });
}

/** 스트리밍 미등록 Source Game 목록만 조회 */
export function useAvailableSourceGamesQuery() {
  const query = useSourceGamesQuery();

  return {
    ...query,
    data: query.data?.filter((game) => !game.isStreaming),
  };
}
