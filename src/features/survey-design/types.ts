/**
 * Survey Design Feature 타입 정의
 */

import type { GameGenre } from '@/features/game';
import type { ConfigValue } from '@/types';

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
// POST /surveys - 설문 생성
// ----------------------------------------

/** POST /surveys Request */
export interface CreateSurveyRequest {
  game_id: number;
  survey_name: string;
  started_at: string;
  ended_at: string;
  test_purpose: TestPurpose;
}

/** 설문 엔티티 */
export interface Survey {
  survey_id: number;
  survey_name: string;
  survey_url: string;
  started_at: string;
  ended_at: string;
  test_purpose: TestPurpose;
  created_at: string;
}

/** POST /surveys Response */
export interface CreateSurveyResponse {
  result: Survey;
}

// ----------------------------------------
// POST /surveys/ai-questions - AI 질문 생성
// ----------------------------------------

/** POST /surveys/ai-questions Request */
export interface GenerateAiQuestionsRequest {
  game_name: string;
  game_context: string;
  game_genre: GameGenre[];
  survey_name: string;
  test_purpose: TestPurpose;
  count: number;
}

/** POST /surveys/ai-questions Response */
export interface GenerateAiQuestionsResponse {
  result: string[];
}

// ----------------------------------------
// POST /surveys/question-feedback - 질문 피드백
// ----------------------------------------

/** POST /surveys/question-feedback Request */
export interface QuestionFeedbackRequest {
  game_name: string;
  game_context: string;
  game_genre: GameGenre[];
  survey_name: string;
  test_purpose: TestPurpose;
  questions: string[];
}

/** 질문 피드백 항목 */
export interface QuestionFeedbackItem {
  question: string;
  summary: string;
  suggestions: string[];
}

/** POST /surveys/question-feedback Response */
export interface QuestionFeedbackResponse {
  result: QuestionFeedbackItem[];
}

// ----------------------------------------
// POST /surveys/fixed-questions - 고정 질문 생성
// ----------------------------------------

/** 고정 질문 항목 */
export interface FixedQuestionItem {
  q_content: string;
  q_order: number;
}

/** POST /surveys/fixed_questions Request */
export interface CreateFixedQuestionsRequest {
  survey_id: number;
  questions: FixedQuestionItem[];
}

/** 고정 질문 생성 결과 */
export interface FixedQuestionsCount {
  count: number;
}

/** POST /surveys/fixed_questions Response */
export interface CreateFixedQuestionsResponse {
  result: FixedQuestionsCount;
}

// ----------------------------------------
// Survey Form (설문 등록 폼)
// ----------------------------------------

/** 설문 폼 상태 */
export type SurveyFormStatus = 'draft' | 'scheduled' | 'active' | 'completed';

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
  selectedQuestionIndices: number[]; // 선택된 질문 인덱스 배열 (Set은 JSON 직렬화 불가)
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
