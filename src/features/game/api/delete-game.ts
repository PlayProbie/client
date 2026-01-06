/**
 * Game API - 게임 삭제
 * DELETE /games/{gameUuid}
 */
import { API_BASE_URL } from '@/constants/api';

/** 게임 삭제 */
export async function deleteGame(gameUuid: string): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/games/${gameUuid}`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
  });

  if (!response.ok) {
    if (response.status === 403) {
      throw new Error('접근 권한이 없습니다.');
    }
    if (response.status === 404) {
      throw new Error('게임을 찾을 수 없습니다.');
    }
    throw new Error('게임 삭제에 실패했습니다.');
  }
}
