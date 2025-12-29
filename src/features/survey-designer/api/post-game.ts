import type { CreateGameRequest, CreateGameResponse } from '@/features/game';

const API_BASE_URL = '/api';

/**
 * POST /games - 게임 생성
 */
export async function postGame(
  data: CreateGameRequest
): Promise<CreateGameResponse> {
  const response = await fetch(`${API_BASE_URL}/games`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error('Failed to create game');
  }

  return response.json();
}
