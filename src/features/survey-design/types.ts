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

// ----------------------------------------
// API Request/Response Types (snake_case)
// ----------------------------------------

/** [API] POST /surveys Request */
export interface ApiCreateSurveyRequest {
  game_id: number;
  survey_name: string;
  started_at: string;
  ended_at: string;
  test_purpose: TestPurpose;
}

/** [API] 설문 엔티티 */
export interface ApiSurvey {
  survey_id: number;
  survey_name: string;
  survey_url: string;
  started_at: string;
  ended_at: string;
  test_purpose: TestPurpose;
  created_at: string;
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
  test_purpose: TestPurpose;
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
  test_purpose: TestPurpose;
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
  survey_id: number;
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
  gameId: number;
  surveyName: string;
  startedAt: string;
  endedAt: string;
  testPurpose: TestPurpose;
}

/** [Client] 설문 엔티티 */
export interface Survey {
  surveyId: number;
  surveyName: string;
  surveyUrl: string;
  startedAt: string;
  endedAt: string;
  testPurpose: TestPurpose;
  createdAt: string;
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
  surveyId: number;
  questions: FixedQuestionItem[];
}

// ----------------------------------------
// Survey Form (설문 등록 폼) - Client Only
// ----------------------------------------

/** 설문 폼 데이터 */
export type SurveyFormData = {
  // Step 0: 게임 정보
  gameName: string;
  gameGenre: GameGenre[];
  gameContext: string;

  // Step 1: 설문 정보
  surveyName: string;
  testPurpose: TestPurpose;
  startedAt: string;
  endedAt: string;

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
    label: '게임 정보',
    description: '테스트할 게임 정보를 입력하세요',
  },
  {
    id: 1,
    label: '설문 정보',
    description: '설문 이름과 테스트 목적을 입력하세요',
  },
  {
    id: 2,
    label: '질문 생성',
    description: 'AI로 설문 질문을 생성합니다',
  },
  {
    id: 3,
    label: '최종 확인',
    description: '입력 내용을 확인하세요',
  },
];
