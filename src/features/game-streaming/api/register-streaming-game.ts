/**
 * POST /streaming-games - 스트리밍 게임 등록
 * 기존 Source Game을 스트리밍 시스템에 등록
 */
import { API_BASE_URL } from '../constants';
import type { ApiStreamingGame, StreamingGame } from '../types';
import { toStreamingGame } from '../types';
import { apiFetch } from '../utils';

export interface RegisterStreamingGameInput {
  gameUuid: string;
}

interface ApiRegisterStreamingGameRequest {
  game_uuid: string;
}

export async function registerStreamingGame(
  input: RegisterStreamingGameInput
): Promise<StreamingGame> {
  const body: ApiRegisterStreamingGameRequest = {
    game_uuid: input.gameUuid,
  };

  const data = await apiFetch<
    ApiStreamingGame,
    ApiRegisterStreamingGameRequest
  >(
    `${API_BASE_URL}/streaming-games`,
    { method: 'POST', body },
    '스트리밍 게임 등록에 실패했습니다.'
  );

  return toStreamingGame(data);
}
