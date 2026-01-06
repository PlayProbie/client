/**
 * Games API MSW Handlers
 * Mock API handlers for game CRUD operations
 */
import { delay, http, HttpResponse } from 'msw';

import type {
  ApiCreateGameRequest,
  ApiGame,
  ApiGameResponse,
  ApiGamesListResponse,
  ApiUpdateGameRequest,
} from '@/features/game/types';

import { MSW_API_BASE_URL } from '../constants';
import { toKSTISOString } from '../utils';

// ----------------------------------------
// Mock Data Store
// ----------------------------------------
const MOCK_GAMES: ApiGame[] = [
  {
    game_uuid: 'game-001-uuid-abcd',
    workspace_uuid: '550e8400-e29b-41d4-a716-446655440000',
    game_name: 'Dark Souls Clone',
    game_genre: ['RPG', 'ACTION'],
    game_context: '중세 판타지 배경의 오픈월드 RPG 게임입니다.',
    created_at: '2025-12-15T10:00:00Z',
    updated_at: '2025-12-20T10:30:00Z',
  },
  {
    game_uuid: 'game-002-uuid-efgh',
    workspace_uuid: '550e8400-e29b-41d4-a716-446655440000',
    game_name: 'Racing Simulator Pro',
    game_genre: ['SIMULATION', 'SPORTS'],
    game_context: '실감나는 레이싱 시뮬레이터입니다.',
    created_at: '2025-12-16T11:00:00Z',
    updated_at: '2025-12-18T15:45:00Z',
  },
  {
    game_uuid: 'game-003-uuid-ijkl',
    workspace_uuid: '550e8400-e29b-41d4-a716-446655440000',
    game_name: 'Puzzle Adventure',
    game_genre: ['CASUAL', 'ADVENTURE'],
    game_context: '다양한 퍼즐을 풀며 진행하는 어드벤처 게임입니다.',
    created_at: '2025-12-17T09:00:00Z',
    updated_at: '2025-12-17T09:00:00Z',
  },
];

/**
 * Games API Handlers
 */
export const gamesHandlers = [
  // ----------------------------------------
  // GET /workspaces/:workspaceUuid/games - 게임 목록 조회
  // ----------------------------------------
  http.get(
    `${MSW_API_BASE_URL}/workspaces/:workspaceUuid/games`,
    async ({ params }) => {
      await delay(300);
      const { workspaceUuid } = params;

      const games = MOCK_GAMES.filter(
        (g) => g.workspace_uuid === workspaceUuid
      );

      const response: ApiGamesListResponse = {
        result: games,
      };

      return HttpResponse.json(response);
    }
  ),

  // ----------------------------------------
  // POST /workspaces/:workspaceUuid/games - 게임 생성
  // ----------------------------------------
  http.post<{ workspaceUuid: string }, ApiCreateGameRequest>(
    `${MSW_API_BASE_URL}/workspaces/:workspaceUuid/games`,
    async ({ params, request }) => {
      await delay(300);
      const { workspaceUuid } = params;
      const body = await request.json();
      const newGame: ApiGame = {
        game_uuid: crypto.randomUUID(),
        workspace_uuid: workspaceUuid as string,
        game_name: body.game_name,
        game_genre: body.game_genre,
        game_context: body.game_context,
        created_at: toKSTISOString(new Date()),
        updated_at: toKSTISOString(new Date()),
      };

      MOCK_GAMES.push(newGame);

      const response: ApiGameResponse = {
        result: newGame,
      };

      return HttpResponse.json(response, { status: 201 });
    }
  ),

  // ----------------------------------------
  // GET /games/:gameUuid - 게임 상세 조회
  // ----------------------------------------
  http.get(`${MSW_API_BASE_URL}/games/:gameUuid`, async ({ params }) => {
    await delay(300);
    const { gameUuid } = params;

    const game = MOCK_GAMES.find((g) => g.game_uuid === gameUuid);

    if (!game) {
      return HttpResponse.json(
        { message: '게임을 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    const response: ApiGameResponse = {
      result: game,
    };

    return HttpResponse.json(response);
  }),

  // ----------------------------------------
  // PUT /games/:gameUuid - 게임 수정
  // ----------------------------------------
  http.put<{ gameUuid: string }, ApiUpdateGameRequest>(
    `${MSW_API_BASE_URL}/games/:gameUuid`,
    async ({ params, request }) => {
      await delay(300);
      const { gameUuid } = params;
      const body = await request.json();

      const gameIndex = MOCK_GAMES.findIndex((g) => g.game_uuid === gameUuid);

      if (gameIndex === -1) {
        return HttpResponse.json(
          { message: '게임을 찾을 수 없습니다.' },
          { status: 404 }
        );
      }

      const updatedGame: ApiGame = {
        ...MOCK_GAMES[gameIndex],
        game_name: body.game_name,
        game_genre: body.game_genre,
        game_context: body.game_context,
        updated_at: toKSTISOString(new Date()),
      };

      MOCK_GAMES[gameIndex] = updatedGame;

      const response: ApiGameResponse = {
        result: updatedGame,
      };

      return HttpResponse.json(response);
    }
  ),

  // ----------------------------------------
  // DELETE /games/:gameUuid - 게임 삭제
  // ----------------------------------------
  http.delete(`${MSW_API_BASE_URL}/games/:gameUuid`, async ({ params }) => {
    await delay(300);
    const { gameUuid } = params;

    const gameIndex = MOCK_GAMES.findIndex((g) => g.game_uuid === gameUuid);

    if (gameIndex === -1) {
      return HttpResponse.json(
        { message: '게임을 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    MOCK_GAMES.splice(gameIndex, 1);

    return new HttpResponse(null, { status: 204 });
  }),
];
