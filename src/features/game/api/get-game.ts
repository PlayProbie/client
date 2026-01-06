/**
 * Game API - 게임 상세 조회
 * GET /games/{gameUuid}
 */
import { API_BASE_URL } from '@/constants/api';

import type { ApiGameResponse, Game } from '../types';
import { toGame } from '../types';

/** 게임 상세 조회 */
export async function getGame(gameUuid: string): Promise<Game> {
  const response = await fetch(`${API_BASE_URL}/games/${gameUuid}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    if (response.status === 404) {
      throw new Error('게임을 찾을 수 없습니다.');
    }
    if (response.status === 403) {
      throw new Error('접근 권한이 없습니다.');
    }
    throw new Error('게임 정보를 불러오는데 실패했습니다.');
  }

  const data: ApiGameResponse = await response.json();
  return toGame(data.result);
}
