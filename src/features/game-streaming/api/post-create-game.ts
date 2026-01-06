/**
 * 임시 게임 생성 API
 * POST /games
 *
 * 테스트용 임시 조치: 빌드 업로드 전 게임 UUID를 얻기 위해 사용
 */
import { fetchWithAuth } from '@/services/api-client';

import { API_BASE_URL } from '../constants';

export interface CreateGameRequest {
  game_name: string;
  game_genre: string[];
  game_context: string;
}

export interface CreateGameResponse {
  result: {
    game_uuid: string;
    game_name: string;
    game_genre: string[];
    game_context: string;
    created_at: string;
  };
}

/** 임시 게임 생성 (테스트용) */
export async function postCreateGame(
  request: CreateGameRequest
): Promise<CreateGameResponse> {
  const response = await fetchWithAuth(`${API_BASE_URL}/games`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => null);
    throw new Error(errorData?.message || '게임 생성에 실패했습니다.');
  }

  return response.json();
}

/**
 * 테스트용 하드코딩 게임 생성
 * 빌드 업로드 테스트를 위해 임시로 게임을 생성하고 UUID를 반환
 */
export async function createTestGame(): Promise<string> {
  const testGame: CreateGameRequest = {
    game_name: 'Test Game for Build Upload',
    game_genre: ['shooter'],
    game_context: 'Test game created for build upload testing',
  };

  const response = await postCreateGame(testGame);
  return response.result.game_uuid;
}
