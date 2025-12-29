/**
 * Survey Designer Feature 타입 정의
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
// POST /surveys/fixed_questions - 고정 질문 생성
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
