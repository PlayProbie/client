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
  SHOOTER: { value: 'shooter', label: '슈팅' },
  STRATEGY: { value: 'strategy', label: '전략' },
  RPG: { value: 'rpg', label: 'RPG' },
  SPORTS: { value: 'sports', label: '스포츠' },
  SIMULATION: { value: 'simulation', label: '시뮬레이션' },
  CASUAL: { value: 'casual', label: '캐주얼' },
} as const;

/** 게임 장르 타입 */
export type GameGenre = ConfigValue<typeof GameGenreConfig>;

// ----------------------------------------
// API Request/Response Types (snake_case)
// ----------------------------------------

/** [API] POST /games Request */
export interface ApiCreateGameRequest {
  game_name: string;
  game_context: string;
  game_genre: GameGenre[];
}

/** [API] 게임 엔티티 */
export interface ApiGame {
  game_id: number;
  game_name: string;
  game_context: string;
  game_genre: GameGenre[];
  created_at: string;
}

/** [API] POST /games Response */
export interface CreateGameResponse {
  result: ApiGame;
}

// ----------------------------------------
// Client State Types (camelCase)
// ----------------------------------------

/** [Client] 게임 생성 요청 */
export interface CreateGameRequest {
  gameName: string;
  gameContext: string;
  gameGenre: GameGenre[];
}

/** [Client] 게임 엔티티 */
export interface Game {
  gameId: number;
  gameName: string;
  gameContext: string;
  gameGenre: GameGenre[];
  createdAt: string;
}

// ----------------------------------------
// Transformer Functions (API -> Client)
// ----------------------------------------

/** API 게임 -> 클라이언트 게임 변환 */
export function toGame(api: ApiGame): Game {
  return {
    gameId: api.game_id,
    gameName: api.game_name,
    gameContext: api.game_context,
    gameGenre: api.game_genre,
    createdAt: api.created_at,
  };
}

/** 클라이언트 게임 생성 요청 -> API 요청 변환 */
export function toApiCreateGameRequest(
  client: CreateGameRequest
): ApiCreateGameRequest {
  return {
    game_name: client.gameName,
    game_context: client.gameContext,
    game_genre: client.gameGenre,
  };
}
