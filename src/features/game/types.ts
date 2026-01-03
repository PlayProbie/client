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

// NOTE: API <-> Client 변환기는 실제 사용 시점에 맞춰 추가합니다.
