import { API_BASE_URL } from '@/constants/api';
import type { ApiCreateGameRequest, ApiGameResponse } from '@/features/game';
import { fetchWithAuth } from '@/services/api-client';

/**
 * POST /games - 게임 생성
 */
export async function postGame(
  data: ApiCreateGameRequest
): Promise<ApiGameResponse> {
  const response = await fetchWithAuth(`${API_BASE_URL}/games`, {
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
