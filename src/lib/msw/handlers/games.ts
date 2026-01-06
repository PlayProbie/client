import { delay, http, HttpResponse } from 'msw';

import type {
  ApiCreateGameRequest,
  CreateGameResponse,
} from '@/features/game/types';

import { MSW_API_BASE_URL } from '../constants';
import { toKSTISOString } from '../utils';

/**
 * POST /api/games - 게임 생성 핸들러
 */
export const gamesHandlers = [
  http.post<never, ApiCreateGameRequest>(
    `${MSW_API_BASE_URL}/games`,
    async ({ request }) => {
      await delay(300);

      const body = await request.json();

      const response: CreateGameResponse = {
        result: {
          game_uuid: crypto.randomUUID(),
          workspace_uuid: crypto.randomUUID(),
          game_name: body.game_name,
          game_genre: body.game_genre,
          game_context: body.game_context,
          created_at: toKSTISOString(new Date()),
          updated_at: toKSTISOString(new Date()),
        },
      };

      return HttpResponse.json(response, { status: 201 });
    }
  ),
];
