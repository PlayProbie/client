/**
 * Games API
 * GET /games - 게임 목록 조회
 */
import { API_BASE_URL } from '@/constants/api';

import type { ApiStreamingGame, StreamingGame } from '../types';
import { toStreamingGame } from '../types';

/** 스트리밍 게임 목록 조회 */
export async function getStreamingGames(): Promise<StreamingGame[]> {
  const response = await fetch(`${API_BASE_URL}/games`, {
    method: 'GET',
  });

  if (!response.ok) {
    throw new Error('게임 목록을 불러오는데 실패했습니다.');
  }

  const data: { result: ApiStreamingGame[] } = await response.json();
  return data.result.map(toStreamingGame);
}

/** 스트리밍 게임 상세 조회 */
export async function getStreamingGameByUuid(
  gameUuid: string
): Promise<StreamingGame | null> {
  try {
    const games = await getStreamingGames();
    return games.find((g) => g.gameUuid === gameUuid) ?? null;
  } catch {
    return null;
  }
}
