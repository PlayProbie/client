import type { ConfigValue } from '@/types';

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

/** POST /games Request */
export interface CreateGameRequest {
  game_name: string;
  game_context: string;
  game_genre: GameGenre[];
}

/** 게임 엔티티 */
export interface Game {
  game_id: number;
  game_name: string;
  game_context: string;
  game_genre: GameGenre[];
  created_at: string;
}

/** POST /games Response */
export interface CreateGameResponse {
  result: Game;
}
