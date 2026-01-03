/**
 * Survey Analytics Feature 타입 정의
 *
 * 명명 규칙:
 * - API 응답/요청 타입: snake_case (서버 응답 그대로)
 * - 클라이언트 상태 타입: camelCase (컴포넌트에서 사용)
 */

// ----------------------------------------
// Common Types
// ----------------------------------------

/** 설문 세션 상태 */
export type SurveySessionStatus = 'COMPLETED' | 'IN_PROGRESS' | 'DROPPED';

/** 질문/답변 타입 */
export type InterviewLogQType = 'FIXED' | 'TAIL';

// ----------------------------------------
// API Response Types (snake_case - 서버 응답 그대로)
// ----------------------------------------

/** [API] 설문 세션 정보 */
export interface ApiSurveySession {
  session_id: string;
  survey_name: string;
  survey_id: number;
  tester_id: string;
  status: SurveySessionStatus;
  ended_at: string;
}

/** [API] 질문-답변 발췌 */
export interface ApiQuestionAnswerExcerpt {
  q_type: InterviewLogQType;
  question_text: string;
  answer_text: string;
}

/** [API] 고정 질문별 응답 묶음 */
export interface ApiFixedQuestionResponse {
  fixed_q_id: number;
  fixed_question: string;
  excerpt: ApiQuestionAnswerExcerpt[];
}

/** [API] 전체 응답 요약 데이터 */
export interface ApiSurveyResultsSummary {
  survey_count: number;
  response_count: number;
}

/** [API] 전체 응답 리스트 아이템 */
export interface ApiSurveyResultListItem extends ApiSurveySession {
  first_question: string;
}

/** [API] 전체 응답 리스트 데이터 */
export interface ApiSurveyResultsList {
  content: ApiSurveyResultListItem[];
  next_cursor: number | null;
  has_next: boolean;
}

/** [API] 응답 세부내용 데이터 */
export interface ApiSurveyResultDetails {
  session: Omit<ApiSurveySession, 'first_question'>;
  by_fixed_question: ApiFixedQuestionResponse[];
}

// ----------------------------------------
// API Response Wrappers
// ----------------------------------------

/** GET /surveys/results/{game_id} Response */
export interface GetSurveyResultsSummaryResponse {
  result: ApiSurveyResultsSummary;
}

/** GET /surveys/results/{game_id}/listup Response */
export interface GetSurveyResultsListResponse {
  result: ApiSurveyResultsList;
}

/** GET /surveys/results/{survey_id}/details/{session_id} Response */
export interface GetSurveyResultDetailsResponse {
  result: ApiSurveyResultDetails;
}

// ----------------------------------------
// Client State Types (camelCase - 컴포넌트에서 사용)
// ----------------------------------------

/** [Client] 설문 세션 정보 */
export interface SurveySession {
  sessionId: string;
  surveyName: string;
  surveyId: number;
  testerId: string;
  status: SurveySessionStatus;
  endedAt: string;
}

/** [Client] 질문-답변 발췌 */
export interface QuestionAnswerExcerpt {
  qType: InterviewLogQType;
  questionText: string;
  answerText: string;
}

/** [Client] 고정 질문별 응답 묶음 */
export interface FixedQuestionResponse {
  fixedQId: number;
  fixedQuestion: string;
  excerpt: QuestionAnswerExcerpt[];
}

/** [Client] 전체 응답 요약 데이터 */
export interface SurveyResultsSummary {
  surveyCount: number;
  responseCount: number;
}

/** [Client] 전체 응답 리스트 아이템 */
export interface SurveyResultListItem extends SurveySession {
  firstQuestion: string;
}

/** [Client] 전체 응답 리스트 데이터 */
export interface SurveyResultsList {
  content: SurveyResultListItem[];
  nextCursor: number | null;
  hasNext: boolean;
}

/** [Client] 응답 세부내용 데이터 */
export interface SurveyResultDetails {
  session: Omit<SurveySession, 'firstQuestion'>;
  byFixedQuestion: FixedQuestionResponse[];
}

// ----------------------------------------
// Request Params (camelCase)
// ----------------------------------------

/** 전체 응답 요약 요청 파라미터 */
export interface GetSurveyResultsSummaryParams {
  gameId: string;
  status?: SurveySessionStatus;
}

/** 전체 응답 리스트 요청 파라미터 */
export interface GetSurveyResultsListParams {
  gameId: string;
  limit?: number;
  cursor?: string;
}

/** 응답 세부내용 요청 파라미터 */
export interface GetSurveyResultDetailsParams {
  surveyId: number;
  sessionId: string;
}
