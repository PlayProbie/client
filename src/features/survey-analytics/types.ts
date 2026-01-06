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
  session_uuid: string;
  survey_name: string;
  survey_uuid: string;
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

/** GET /surveys/results/{game_uuid} Response */
export interface GetSurveyResultsSummaryResponse {
  result: ApiSurveyResultsSummary;
}

/** GET /surveys/results/{game_uuid}/listup Response */
export interface GetSurveyResultsListResponse {
  result: ApiSurveyResultsList;
}

/** GET /surveys/results/{survey_uuid}/details/{session_uuid} Response */
export interface GetSurveyResultDetailsResponse {
  result: ApiSurveyResultDetails;
}

// ----------------------------------------
// Client State Types (camelCase - 컴포넌트에서 사용)
// ----------------------------------------

// ----------------------------------------
// Question Analysis Types (AI 분석 결과)
// ----------------------------------------

/** 감정 타입 (GEQ 기반) */
export type EmotionType =
  | '성취감'
  | '몰입감'
  | '집중도'
  | '긴장감'
  | '도전감'
  | '즐거움'
  | '불쾌감'
  | '중립';

/** GEQ 7차원 감정 점수 */
export interface GEQScores {
  competence: number; // 성취감
  immersion: number; // 몰입감
  flow: number; // 집중도
  tension: number; // 긴장감
  challenge: number; // 도전감
  positive_affect: number; // 즐거움
  negative_affect: number; // 불쾌감
}

/** 클러스터 정보 */
export interface ClusterInfo {
  summary: string;
  percentage: number;
  count: number;
  emotion_type: EmotionType;
  geq_scores: GEQScores;
  emotion_detail: string;
  answer_ids: string[];
  satisfaction: number;
  keywords: string[];
  representative_answer_ids: string[];
  representative_answers?: string[]; // 대표 답변 텍스트 (Mock 및 Optional)
}

/** 감정 분포 */
export interface SentimentDistribution {
  positive: number;
  neutral: number;
  negative: number;
}

/** 전체 감정 통계 */
export interface SentimentStats {
  score: number;
  label: string;
  distribution: SentimentDistribution;
}

/** 이상치 정보 */
export interface OutlierInfo {
  count: number;
  summary: string;
  answer_ids: string[];
}

/** 질문별 AI 분석 결과 */
export interface QuestionAnalysisResult {
  question_id: number;
  total_answers: number;
  clusters: ClusterInfo[];
  sentiment: SentimentStats;
  outliers: OutlierInfo | null;
  meta_summary: string | null;
}

/** SSE로 받는 질문 분석 래퍼 */
export interface QuestionResponseAnalysisWrapper {
  fixedQuestionId: number;
  resultJson: string; // JSON.parse하면 QuestionAnalysisResult
}

/** [Client] 설문 세션 정보 */
export interface SurveySession {
  sessionUuid: string;
  surveyName: string;
  surveyUuid: string;
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
  gameUuid: string;
  status?: SurveySessionStatus;
}

/** 전체 응답 리스트 요청 파라미터 */
export interface GetSurveyResultsListParams {
  gameUuid: string;
  limit?: number;
  cursor?: string;
}

/** 응답 세부내용 요청 파라미터 */
export interface GetSurveyResultDetailsParams {
  surveyUuid: string;
  sessionUuid: string;
}
