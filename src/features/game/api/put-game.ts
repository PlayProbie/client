/**
 * Game API - 게임 수정
 * PUT /games/{gameUuid}
 */
import { API_BASE_URL } from '@/constants/api';

import type { ApiGameResponse, Game, UpdateGameRequest } from '../types';
import { toApiUpdateGameRequest, toGame } from '../types';

export interface PutGameInput {
  gameUuid: string;
  data: UpdateGameRequest;
}

/** 게임 수정 */
export async function putGame(input: PutGameInput): Promise<Game> {
  const { gameUuid, data } = input;
  const body = toApiUpdateGameRequest(data);

  const response = await fetch(`${API_BASE_URL}/games/${gameUuid}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    if (response.status === 403) {
      throw new Error('접근 권한이 없습니다.');
    }
    if (response.status === 404) {
      throw new Error('게임을 찾을 수 없습니다.');
    }
    throw new Error('게임 수정에 실패했습니다.');
  }

  const result: ApiGameResponse = await response.json();
  return toGame(result.result);
}
