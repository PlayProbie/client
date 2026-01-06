/**
 * Game API - 게임 목록 조회
 * GET /workspaces/{workspaceUuid}/games
 */
import { API_BASE_URL } from '@/constants/api';

import type { ApiGamesListResponse, Game } from '../types';
import { toGame } from '../types';

/** 워크스페이스별 게임 목록 조회 */
export async function getGames(workspaceUuid: string): Promise<Game[]> {
  const response = await fetch(
    `${API_BASE_URL}/workspaces/${workspaceUuid}/games`,
    {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    }
  );

  if (!response.ok) {
    throw new Error('게임 목록을 불러오는데 실패했습니다.');
  }

  const data: ApiGamesListResponse = await response.json();
  return data.result.map(toGame);
}
