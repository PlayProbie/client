/**
 * Survey Analytics Feature 타입 정의
 */

// ----------------------------------------
// Common Types
// ----------------------------------------

/** 설문 세션 상태 */
export type SurveySessionStatus = 'COMPLETED' | 'IN_PROGRESS' | 'DROPPED';

/** 질문/답변 타입 */
export type InterviewLogQType = 'FIXED' | 'TAIL';

/** 설문 세션 정보 */
export interface SurveySession {
  session_id: string;
  survey_name: string;
  survey_id: number;
  tester_id: string;
  status: SurveySessionStatus;
  ended_at: string;
}

/** 질문-답변 발췌 */
export interface QuestionAnswerExcerpt {
  q_type: InterviewLogQType;
  question_text: string;
  answer_text: string;
}

/** 고정 질문별 응답 묶음 */
export interface FixedQuestionResponse {
  fixed_q_id: number;
  fixed_question: string;
  excerpt: QuestionAnswerExcerpt[];
}

// ----------------------------------------
// GET /surveys/results/{game_id} - 전체 응답 요약
// ----------------------------------------

/** 전체 응답 요약 요청 파라미터 */
export interface GetSurveyResultsSummaryParams {
  gameId: string;
  status?: SurveySessionStatus;
}

/** 전체 응답 요약 데이터 */
export interface SurveyResultsSummary {
  survey_count: number;
  response_count: number;
}

/** GET /surveys/results/{game_id} Response */
export interface GetSurveyResultsSummaryResponse {
  result: SurveyResultsSummary;
}

// ----------------------------------------
// GET /surveys/results/{game_id}/listup - 전체 응답 리스트
// ----------------------------------------

/** 전체 응답 리스트 요청 파라미터 */
export interface GetSurveyResultsListParams {
  gameId: string;
  limit?: number;
  cursor?: string;
}

/** 전체 응답 리스트 아이템 (세션 정보 + 첫 번째 질문) */
export interface SurveyResultListItem extends SurveySession {
  first_question: string;
}

/** 전체 응답 리스트 데이터 */
export interface SurveyResultsList {
  content: SurveyResultListItem[];
  nextCursor: number | null;
  hasNext: boolean;
}

/** GET /surveys/results/{game_id}/listup Response */
export interface GetSurveyResultsListResponse {
  result: SurveyResultsList;
}

// ----------------------------------------
// GET /surveys/results/{survey_id}/details/{session_id} - 응답 세부내용
// ----------------------------------------

/** 응답 세부내용 요청 파라미터 */
export interface GetSurveyResultDetailsParams {
  surveyId: number;
  sessionId: string;
}

/** 응답 세부내용 데이터 */
export interface SurveyResultDetails {
  session: Omit<SurveySession, 'first_question'>;
  by_fixed_question: FixedQuestionResponse[];
}

/** GET /surveys/results/{survey_id}/details/{session_id} Response */
export interface GetSurveyResultDetailsResponse {
  result: SurveyResultDetails;
}
