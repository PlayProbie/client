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
  ACTION: { value: 'ACTION', label: '액션' },
  ADVENTURE: { value: 'ADVENTURE', label: '어드벤처' },
  SIMULATION: { value: 'SIMULATION', label: '시뮬레이션' },
  PUZZLE: { value: 'PUZZLE', label: '퍼즐' },
  STRATEGY: { value: 'STRATEGY', label: '전략' },
  RPG: { value: 'RPG', label: 'RPG' },
  ARCADE: { value: 'ARCADE', label: '아케이드' },
  HORROR: { value: 'HORROR', label: '호러' },
  SHOOTER: { value: 'SHOOTER', label: '슈팅' },
  VISUAL_NOVEL: { value: 'VISUAL_NOVEL', label: '비주얼 노벨' },
  ROGUELIKE: { value: 'ROGUELIKE', label: '로그라이크' },
  SPORTS: { value: 'SPORTS', label: '스포츠' },
  RHYTHM: { value: 'RHYTHM', label: '리듬' },
  FIGHTING: { value: 'FIGHTING', label: '대전' },
  CASUAL: { value: 'CASUAL', label: '캐주얼' },
} as const;

/** 게임 요소 영문 키 -> 한글 라벨 매핑 */
export const ELEMENT_LABELS: Record<string, string> = {
  // 공통 필수
  core_mechanic: '핵심 메카닉',
  player_goal: '플레이어 목표',

  // 액션
  combat_system: '전투 시스템',
  control_scheme: '조작 방식',

  // 어드벤처/내러티브
  narrative: '스토리/세계관',
  main_character: '주인공/캐릭터',
  exploration_element: '탐험 요소',

  // 시뮬레이션
  simulation_target: '시뮬레이션 대상',
  management_element: '관리 요소',

  // 퍼즐
  puzzle_mechanic: '퍼즐 방식',

  // 전략
  decision_type: '의사결정 요소',
  resource_system: '자원 시스템',

  // RPG
  progression_system: '성장 시스템',

  // 아케이드
  score_system: '스코어 시스템',
  difficulty_curve: '난이도 곡선',

  // 호러
  horror_element: '공포 연출 방식',
  atmosphere: '분위기',

  // 슈팅
  shooting_mechanic: '슈팅 방식',
  weapon_variety: '무기 종류',

  // 비주얼 노벨
  choice_system: '선택지 시스템',

  // 로그라이크
  run_structure: '런 구조',
  permanent_progression: '영구 성장 요소',
  randomness_element: '랜덤 요소',

  // 스포츠
  sport_type: '종목',
  play_mode: '플레이 모드',

  // 리듬
  rhythm_system: '리듬 시스템',
  music_genre: '음악 장르',
  input_method: '입력 방식',

  // 대전
  fighting_system: '대전 시스템',
  character_roster: '캐릭터 로스터',

  // 캐주얼
  session_length: '한 판 길이',
};

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
  extracted_elements?: string; // JSON string
  created_at: string;
  updated_at: string;
}

/** [API] 게임 요소 추출 응답 */
export interface ApiExtractElementsResponse {
  elements: Record<string, string | null>;
  required_fields: string[];
  optional_fields: string[];
  missing_required: string[];
}

/** [API] POST /workspaces/{workspaceUuid}/games Request */
export interface ApiCreateGameRequest {
  game_name: string;
  game_genre: string[];
  game_context: string;
  extracted_elements?: string; // JSON string
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
  extractedElements?: string; // JSON string
  createdAt: string;
  updatedAt: string;
}

/** [Client] 추출된 게임 요소 */
export interface ExtractedElements {
  elements: Record<string, string | null>;
  requiredFields: string[];
  optionalFields: string[];
  missingRequired: string[];
}

/** [Client] 게임 생성 요청 */
export interface CreateGameRequest {
  gameName: string;
  gameGenre: string[];
  gameContext: string;
  extractedElements?: string; // JSON string
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
    extractedElements: api.extracted_elements,
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
    extracted_elements: client.extractedElements,
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
