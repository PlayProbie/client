/**
 * Streaming Games API
 * GET /api/streaming-games - 스트리밍 게임 목록 조회
 */
import type { ApiStreamingGame, StreamingGame } from '../types';
import { toStreamingGame } from '../types';
import { apiFetch } from '../utils';

/** 스트리밍 게임 목록 조회 */
export async function getStreamingGames(): Promise<StreamingGame[]> {
  const data = await apiFetch<ApiStreamingGame[]>(
    '/api/streaming-games',
    { method: 'GET' },
    '스트리밍 게임 목록을 불러오는데 실패했습니다.'
  );
  return data.map(toStreamingGame);
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
