/**
 * Survey Design Feature 타입 정의
 *
 * 명명 규칙:
 * - API 응답/요청 타입: snake_case (서버 응답 그대로)
 * - 클라이언트 상태 타입: camelCase (컴포넌트에서 사용)
 */

import type { GameGenre } from '@/features/game';
import type { ConfigValue } from '@/types';

// ----------------------------------------
// Common Types
// ----------------------------------------

/** 설문 목적 정의 (value + label) */
export const TestPurposeConfig = {
  GAMEPLAY_VALIDATION: { value: 'gameplay-validation', label: '게임성 검증' },
  UI_UX_FEEDBACK: { value: 'ui-ux-feedback', label: 'UI/UX 피드백' },
  BALANCE_TESTING: { value: 'balance-testing', label: '밸런스 테스트' },
  STORY_EVALUATION: { value: 'story-evaluation', label: '스토리 평가' },
  BUG_REPORTING: { value: 'bug-reporting', label: '버그 리포트' },
  OVERALL_EVALUATION: { value: 'overall-evaluation', label: '종합 평가' },
} as const;

/** 설문 목적 타입 */
export type TestPurpose = ConfigValue<typeof TestPurposeConfig>;

/** 테스트 단계 정의 */
export const TestStageConfig = {
  PROTOTYPE: { value: 'prototype', label: '프로토타입' },
  PLAYTEST: { value: 'playtest', label: '플레이테스트' },
  PRE_LAUNCH: { value: 'pre_launch', label: '출시 전' },
} as const;

/** 테스트 단계 타입 */
export type TestStage = ConfigValue<typeof TestStageConfig>;

/** 테마 대분류 정의 */
export const ThemeCategoryConfig = {
  GAMEPLAY: { value: 'gameplay', label: '게임성 검증' },
  UI_UX: { value: 'ui_ux', label: 'UI/UX 피드백' },
  BALANCE: { value: 'balance', label: '밸런스 테스트' },
  STORY: { value: 'story', label: '스토리 평가' },
  BUG: { value: 'bug', label: '버그 리포트' },
  OVERALL: { value: 'overall', label: '종합 평가' },
} as const;

/** 테마 대분류 타입 */
export type ThemeCategory = ConfigValue<typeof ThemeCategoryConfig>;

/** 테마 소분류 정의 */
export const ThemeDetailConfig = {
  // GAMEPLAY
  CORE_LOOP: { value: 'core_loop', label: '코어루프', category: 'gameplay' },
  FUN: { value: 'fun', label: '재미', category: 'gameplay' },
  REPLAY_INTENT: {
    value: 'replay_intent',
    label: '재플레이 의향',
    category: 'gameplay',
  },
  // UI_UX
  ONBOARDING: { value: 'onboarding', label: '온보딩', category: 'ui_ux' },
  CONTROLS: { value: 'controls', label: '조작감', category: 'ui_ux' },
  READABILITY: { value: 'readability', label: '가독성', category: 'ui_ux' },
  // BALANCE
  DIFFICULTY: { value: 'difficulty', label: '난이도', category: 'balance' },
  GROWTH: { value: 'growth', label: '성장 곡선', category: 'balance' },
  ECONOMY: { value: 'economy', label: '경제 밸런스', category: 'balance' },
  // STORY
  NARRATIVE: { value: 'narrative', label: '서사 몰입', category: 'story' },
  CHARACTER: { value: 'character', label: '캐릭터 매력', category: 'story' },
  WORLD: { value: 'world', label: '세계관', category: 'story' },
  // BUG
  CRASH: { value: 'crash', label: '크래시', category: 'bug' },
  PERFORMANCE: { value: 'performance', label: '성능', category: 'bug' },
  VISUAL_GLITCH: {
    value: 'visual_glitch',
    label: '시각적 버그',
    category: 'bug',
  },
  // OVERALL
  NPS: { value: 'nps', label: 'NPS', category: 'overall' },
  PURCHASE_INTENT: {
    value: 'purchase_intent',
    label: '구매 의향',
    category: 'overall',
  },
  RECOMMEND: { value: 'recommend', label: '추천 의향', category: 'overall' },
} as const;

/** 테마 소분류 타입 */
export type ThemeDetail = ConfigValue<typeof ThemeDetailConfig>;

// ----------------------------------------
// API Request/Response Types (snake_case)
// ----------------------------------------

/** [API] POST /surveys Request */
export interface ApiCreateSurveyRequest {
  game_uuid: string;
  survey_name: string;
  started_at: string;
  ended_at: string;
  test_stage?: TestStage;
  /** 테마 대분류 우선순위 (최대 3개, 순서대로) */
  theme_priorities: ThemeCategory[];
  /** 테마 소분류 (대분류별 선택된 세부 테마) */
  theme_details?: Partial<Record<ThemeCategory, ThemeDetail[]>>;
  version_note?: string;
}

/** [API] 설문 엔티티 */
export interface ApiSurvey {
  survey_uuid: string;
  survey_name: string;
  survey_url: string;
  started_at: string;
  ended_at: string;
  created_at: string;
  test_stage?: TestStage;
  /** 테마 대분류 우선순위 (1~3개, 순서대로) */
  theme_priorities: ThemeCategory[];
  /** 테마 소분류 (선택사항) */
  theme_details?: Partial<Record<ThemeCategory, ThemeDetail[]>>;
  version_note?: string;
}

/** [API] POST /surveys Response */
export interface CreateSurveyResponse {
  result: ApiSurvey;
}

/** [API] POST /surveys/ai-questions Request */
export interface ApiGenerateAiQuestionsRequest {
  game_name: string;
  game_context: string;
  game_genre: GameGenre[];
  survey_name: string;
  /** 테마 대분류 우선순위 (1~3개, 순서대로) */
  theme_priorities: ThemeCategory[];
  /** 테마 소분류 (대분류별 선택된 세부 테마, 선택사항) */
  theme_details?: Partial<Record<ThemeCategory, ThemeDetail[]>>;
  count: number;
}

/** [API] POST /surveys/ai-questions Response */
export interface GenerateAiQuestionsResponse {
  result: string[];
}

/** [API] POST /surveys/question-feedback Request */
export interface ApiQuestionFeedbackRequest {
  game_name: string;
  game_context: string;
  game_genre: GameGenre[];
  survey_name: string;
  /** 테마 대분류 우선순위 (1~3개, 순서대로) */
  theme_priorities: ThemeCategory[];
  /** 테마 소분류 (대분류별 선택된 세부 테마, 선택사항) */
  theme_details?: Partial<Record<ThemeCategory, ThemeDetail[]>>;
  questions: string[];
}

/** [API] 질문 피드백 응답 항목 */
export interface ApiQuestionFeedbackResponseItem {
  question: string;
  ai_feedback: string;
  suggestions: string[];
}

/** [API] POST /surveys/question-feedback Response */
export interface QuestionFeedbackResponse {
  result: ApiQuestionFeedbackResponseItem;
}

/** [API] 고정 질문 항목 */
export interface ApiFixedQuestionItem {
  q_content: string;
  q_order: number;
}

/** [API] POST /surveys/fixed_questions Request */
export interface ApiCreateFixedQuestionsRequest {
  survey_uuid: string;
  questions: ApiFixedQuestionItem[];
}

/** [API] 고정 질문 생성 결과 */
export interface ApiFixedQuestionsCount {
  count: number;
}

/** [API] POST /surveys/fixed_questions Response */
export interface CreateFixedQuestionsResponse {
  result: ApiFixedQuestionsCount;
}

// ----------------------------------------
// Client State Types (camelCase)
// ----------------------------------------

/** [Client] 설문 생성 요청 */
export interface CreateSurveyRequest {
  gameUuid: string;
  surveyName: string;
  startedAt: string;
  endedAt: string;
  testPurpose: TestPurpose;
  // 신규 필드
  testStage: TestStage;
  themePriorities: ThemeCategory[];
  themeDetails?: Record<ThemeCategory, ThemeDetail[]>;
  versionNote?: string;
}

/** [Client] 설문 엔티티 */
export interface Survey {
  surveyId: number;
  surveyUuid: string;
  surveyName: string;
  surveyUrl: string;
  startedAt: string;
  endedAt: string;
  testPurpose: TestPurpose;
  createdAt: string;
  // 신규 필드
  testStage: TestStage;
  themePriorities: ThemeCategory[];
  themeDetails?: Record<ThemeCategory, ThemeDetail[]>;
  versionNote?: string;
}

/** [Client] 질문 피드백 항목 */
export interface QuestionFeedbackItem {
  question: string;
  aiFeedback: string;
  suggestions: string[];
}

/** [Client] 고정 질문 항목 */
export interface FixedQuestionItem {
  qContent: string;
  qOrder: number;
}

/** [Client] 고정 질문 생성 요청 */
export interface CreateFixedQuestionsRequest {
  surveyUuid: string;
  questions: FixedQuestionItem[];
}

// ----------------------------------------
// Survey Form (설문 등록 폼) - Client Only
// ----------------------------------------

/** 설문 폼 데이터 */
export type SurveyFormData = {
  // Step 0: 게임 정보 (또는 gameId로 대체)
  gameId?: number;
  gameName: string;
  gameGenre: GameGenre[];
  gameContext: string;

  // Step 1: 설문 정보
  surveyName: string;
  testPurpose: TestPurpose;
  startedAt: string;
  endedAt: string;

  // 신규 필드
  testStage: TestStage;
  themePriorities: ThemeCategory[];
  themeDetails: Partial<Record<ThemeCategory, ThemeDetail[]>>;
  versionNote: string;

  // Step 2: 질문 생성
  questions: string[];
  selectedQuestionIndices: number[];
};

/** 설문 폼 스텝 */
export type SurveyFormStep = {
  id: number;
  label: string;
  description?: string;
};

/** 설문 폼 스텝 정의 */
export const SURVEY_FORM_STEPS: SurveyFormStep[] = [
  {
    id: 0,
    label: '설문 기본 정보',
    description: '게임 정보와 설문 이름을 확인하세요',
  },
  {
    id: 1,
    label: '생성 방식 선택',
    description: '질문 생성 방식을 선택하세요',
  },
  {
    id: 2,
    label: '질문 생성',
    description: 'AI 또는 직접 질문을 생성합니다',
  },
  {
    id: 3,
    label: '최종 확인',
    description: '입력 내용을 확인하세요',
  },
];
