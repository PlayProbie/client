/**
 * Game API - 게임 생성
 * POST /workspaces/{workspaceUuid}/games
 */
import { API_BASE_URL } from '@/constants/api';

import type { ApiGameResponse, CreateGameRequest, Game } from '../types';
import { toApiCreateGameRequest, toGame } from '../types';

export interface PostGameInput {
  workspaceUuid: string;
  data: CreateGameRequest;
}

/** 게임 생성 */
export async function postGame(input: PostGameInput): Promise<Game> {
  const { workspaceUuid, data } = input;
  const body = toApiCreateGameRequest(data);

  const response = await fetch(
    `${API_BASE_URL}/workspaces/${workspaceUuid}/games`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    }
  );

  if (!response.ok) {
    if (response.status === 403) {
      throw new Error('접근 권한이 없습니다.');
    }
    if (response.status === 404) {
      throw new Error('워크스페이스를 찾을 수 없습니다.');
    }
    throw new Error('게임 생성에 실패했습니다.');
  }

  const result: ApiGameResponse = await response.json();
  return toGame(result.result);
}
