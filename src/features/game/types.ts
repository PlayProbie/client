import type { ConfigValue } from '@/types';

/**
 * Game Feature 타입 정의
 *
 * 명명 규칙:
 * - API 응답/요청 타입: snake_case (서버 응답 그대로)
 * - 클라이언트 상태 타입: camelCase (컴포넌트에서 사용)
 */

// ----------------------------------------
// Common Types
// ----------------------------------------

/** 게임 장르 정의 (value + label) */
export const GameGenreConfig = {
  SHOOTER: { value: 'SHOOTER', label: '슈팅' },
  STRATEGY: { value: 'STRATEGY', label: '전략' },
  RPG: { value: 'RPG', label: 'RPG' },
  ACTION: { value: 'ACTION', label: '액션' },
  ADVENTURE: { value: 'ADVENTURE', label: '어드벤처' },
  SPORTS: { value: 'SPORTS', label: '스포츠' },
  SIMULATION: { value: 'SIMULATION', label: '시뮬레이션' },
  CASUAL: { value: 'CASUAL', label: '캐주얼' },
} as const;

/** 게임 장르 타입 */
export type GameGenre = ConfigValue<typeof GameGenreConfig>;

// ----------------------------------------
// API Request/Response Types (snake_case)
// ----------------------------------------

/** [API] Game 엔티티 */
export interface ApiGame {
  game_uuid: string;
  workspace_uuid: string;
  game_name: string;
  game_genre: string[];
  game_context: string;
  created_at: string;
  updated_at: string;
}

/** [API] POST /workspaces/{workspaceUuid}/games Request */
export interface ApiCreateGameRequest {
  game_name: string;
  game_genre: string[];
  game_context: string;
}

/** [API] PUT /games/{gameUuid} Request */
export interface ApiUpdateGameRequest {
  game_name: string;
  game_genre: string[];
  game_context: string;
}

/** [API] Game Response wrapper */
export interface ApiGameResponse {
  result: ApiGame;
}

/** [API] Games List Response wrapper */
export interface ApiGamesListResponse {
  result: ApiGame[];
}

// ----------------------------------------
// Client State Types (camelCase)
// ----------------------------------------

/** [Client] 게임 엔티티 */
export interface Game {
  gameUuid: string;
  workspaceUuid: string;
  gameName: string;
  gameGenre: string[];
  gameContext: string;
  createdAt: string;
  updatedAt: string;
}

/** [Client] 게임 생성 요청 */
export interface CreateGameRequest {
  gameName: string;
  gameGenre: string[];
  gameContext: string;
}

/** [Client] 게임 수정 요청 */
export interface UpdateGameRequest {
  gameName: string;
  gameGenre: string[];
  gameContext: string;
}

// ----------------------------------------
// Transformers
// ----------------------------------------

/** ApiGame → Game 변환 */
export function toGame(api: ApiGame): Game {
  return {
    gameUuid: api.game_uuid,
    workspaceUuid: api.workspace_uuid,
    gameName: api.game_name,
    gameGenre: api.game_genre,
    gameContext: api.game_context,
    createdAt: api.created_at,
    updatedAt: api.updated_at,
  };
}

/** CreateGameRequest → ApiCreateGameRequest 변환 */
export function toApiCreateGameRequest(
  client: CreateGameRequest
): ApiCreateGameRequest {
  return {
    game_name: client.gameName,
    game_genre: client.gameGenre,
    game_context: client.gameContext,
  };
}

/** UpdateGameRequest → ApiUpdateGameRequest 변환 */
export function toApiUpdateGameRequest(
  client: UpdateGameRequest
): ApiUpdateGameRequest {
  return {
    game_name: client.gameName,
    game_genre: client.gameGenre,
    game_context: client.gameContext,
  };
}
