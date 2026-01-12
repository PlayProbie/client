/**
 * Survey Session Feature 타입 정의
 * 설문 진행(채팅) 관련 API 타입
 *
 * 명명 규칙:
 * - API 응답/요청 타입: snake_case (서버 응답 그대로)
 * - 클라이언트 상태 타입: camelCase (컴포넌트에서 사용)
 */

// ----------------------------------------
// Common Types
// ----------------------------------------

/** 설문 세션 상태 */
// ----------------------------------------
// Common Types
// ----------------------------------------

/** 설문 세션 상태 */
export type SurveySessionStatus = 'IN_PROGRESS' | 'COMPLETED' | 'DROPPED';

/** 인터뷰 로그 질문 타입 */
export type InterviewLogQType =
  | 'FIXED'
  | 'TAIL'
  | 'OPENING'
  | 'CLOSING'
  | 'GREETING'
  | 'REACTION';

/** 테스터 프로필 데이터 */
export interface TesterProfile {
  ageGroup: string;
  gender: string;
  preferGenre: string;
}

// ----------------------------------------
// API Response Types (snake_case)
// ----------------------------------------

/** [API] 채팅 세션 정보 */
export interface ApiChatSession {
  session_uuid: string;
  survey_uuid: string;
  status: SurveySessionStatus;
}

/** [API] 저장된 대화 로그 */
export interface ApiSavedChatLog {
  turn_num: number;
  q_type: InterviewLogQType;
  fixed_q_id: number | null;
  question_text: string;
  answer_text: string;
  answered_at: string;
}

/** [API] 새 대화 세션 생성 결과 데이터 */
export interface ApiCreateChatSessionResult {
  session: ApiChatSession;
  sse_url: string;
}

/** [API] POST /interview/{survey_uuid} Response */
export interface CreateChatSessionResponse {
  result: ApiCreateChatSessionResult;
}

// ----------------------------------------
// SSE Event Types (snake_case for API)
// ----------------------------------------

/** [API] SSE connect 이벤트 데이터 */
export type ApiSSEConnectEventData = string; // "connected"

/** [API] SSE question 이벤트 데이터 */
export interface ApiSSEQuestionEventData {
  fixed_q_id: number | null;
  q_type: InterviewLogQType;
  question_text: string;
  turn_num: number;
  order: number;
  total_questions: number;
}

/** [API] SSE continue 이벤트 데이터 (스트리밍) */
export interface ApiSSEContinueEventData {
  fixed_q_id: number | null;
  q_type: InterviewLogQType;
  question_text: string; // 부분 텍스트
  turn_num: number;
  order: number;
  total_questions: number;
}

/** [API] SSE start 이벤트 데이터 */
export interface ApiSSEStartEventData {
  status: 'processing';
}

/** [API] SSE reaction 이벤트 데이터 */
export interface ApiSSEReactionEventData {
  reaction_text: string;
  turn_num: number;
}

/** [API] SSE generate_tail_complete 이벤트 데이터 */
export interface ApiSSEGenerateTailCompleteEventData {
  fixed_q_id: number | null;
  order: number;
  total_questions: number;
}

/** [API] SSE interview_complete 이벤트 데이터 */
export interface ApiSSEInterviewCompleteEventData {
  status: 'completed';
}

/** [API] SSE done 이벤트 데이터 (AI 응답 완료) */
export interface ApiSSEDoneEventData {
  turn_num: number;
  // 향후 확장을 위해 should_end 등 추가 가능 (현재는 클라이언트에서 크게 안씀)
}

/** [API] SSE Error 이벤트 데이터 */
export interface ApiSSEErrorEventData {
  code: string;
  message: string;
}

/** [API] SSE 이벤트 (유니온 타입) */
export type ApiSSEEvent =
  | { event: 'connect'; data: ApiSSEConnectEventData }
  | { event: 'question'; data: ApiSSEQuestionEventData }
  | { event: 'continue'; data: ApiSSEContinueEventData }
  | { event: 'start'; data: ApiSSEStartEventData }
  | { event: 'done'; data: ApiSSEDoneEventData }
  | { event: 'interview_complete'; data: ApiSSEInterviewCompleteEventData }
  | { event: 'generate_tail_complete'; data: ApiSSEGenerateTailCompleteEventData }
  | { event: 'error'; data: ApiSSEErrorEventData };

/** [API] 응답자 대답 전송 요청 바디 */
export interface ApiSendMessageRequest {
  fixed_q_id: number | null;
  turn_num: number;
  answer_text: string;
  question_text: string;
}

/** [API] 응답자 대답 전송 결과 데이터 */
export interface ApiSendMessageResult {
  turn_num: number;
  q_type: InterviewLogQType;
  fixed_q_id: number | null;
  question_text: string;
  answer_text: string;
}

/** [API] POST /interview/{session_uuid}/messages Response */
export interface SendMessageResponse {
  result: ApiSendMessageResult;
}

// ----------------------------------------
// Client State Types (camelCase)
// ----------------------------------------

/** [Client] 채팅 세션 정보 */
export interface ChatSession {
  sessionUuid: string;
  surveyUuid: string;
  status: SurveySessionStatus;
}

/** [Client] 저장된 대화 로그 */
export interface SavedChatLog {
  turnNum: number;
  qType: InterviewLogQType;
  fixedQId: number | null;
  questionText: string;
  answerText: string;
  answeredAt: string;
}

/** [Client] SSE Question 이벤트 데이터 */
export interface SSEQuestionEventData {
  fixedQId: number | null;
  qType: InterviewLogQType;
  questionText: string;
  turnNum: number;
  order: number;
  totalQuestions: number;
}

/** [Client] SSE Continue 이벤트 데이터 */
export interface SSEContinueEventData {
  fixedQId: number | null;
  qType: InterviewLogQType;
  questionText: string;
  turnNum: number;
  order: number;
  totalQuestions: number;
}

/** [Client] SSE Reaction 이벤트 데이터 */
export interface SSEReactionEventData {
  reactionText: string;
  turnNum: number;
}

/** [Client] SSE GenerateTailComplete 이벤트 데이터 */
export interface SSEGenerateTailCompleteEventData {
  fixedQId: number | null;
  order: number;
  totalQuestions: number;
}

/** [Client] 채팅 메시지 데이터 (클라이언트 상태) */
export interface ChatMessageData {
  id: string;
  type: 'ai' | 'user';
  content: string;
  turnNum: number;
  qType?: InterviewLogQType;
  fixedQId?: number | null;
  order?: number;
  totalQuestions?: number;
  timestamp: Date;
}

// ----------------------------------------
// Request Params (camelCase)
// ----------------------------------------

/** 새 대화 세션 생성 요청 파라미터 */
export interface CreateChatSessionParams {
  surveyUuid: string;
  sessionUuid?: string;
  testerProfile?: TesterProfile;
}

/** 응답자 대답 전송 요청 파라미터 */
export interface SendMessageParams {
  sessionUuid: string;
}

/** 응답자 대답 전송 요청 바디 (Client) */
export interface SendMessageRequest {
  fixedQId: number | null;
  turnNum: number;
  answerText: string;
  questionText: string;
}

// ----------------------------------------
// Hook Types (camelCase)
// ----------------------------------------

/** useChatSSE 훅 옵션 */
export interface UseChatSSEOptions {
  sessionUuid: string;
  onConnect?: () => void;
  onQuestion?: (data: SSEQuestionEventData) => void;
  onContinue?: (data: SSEContinueEventData) => void;
  onGreetingContinue?: (data: SSEContinueEventData) => void;
  onReaction?: (data: SSEReactionEventData) => void;
  onGenerateTailComplete?: (data: SSEGenerateTailCompleteEventData) => void;
  onStart?: () => void;
  onDone?: (turnNum: number) => void;
  onInterviewComplete?: () => void;
  onError?: (error: string) => void;
  onOpen?: () => void;
  onDisconnect?: () => void;
}

/** useChatSSE 훅 반환 타입 */
export interface UseChatSSEReturn {
  isConnected: boolean;
  connect: () => void;
  disconnect: () => void;
}

/** useChatSession 훅 옵션 */
export interface UseChatSessionOptions {
  sessionUuid: string;
  surveyUuid?: string;
}

/** useChatSession 훅 반환 타입 */
export interface UseChatSessionReturn {
  isReady: boolean;
  isComplete: boolean;
  isLoading: boolean;
  isStreaming: boolean;
  error: string | null;
  messages: ChatMessageData[];
  currentTurnNum: number;
  currentFixedQId: number | null;
  sendAnswer: (answerText: string) => Promise<void>;
}

// ----------------------------------------
// Transformer Functions (API -> Client)
// ----------------------------------------

/** API SSE Question 이벤트 -> 클라이언트 변환 */
export function toSSEQuestionEventData(
  api: ApiSSEQuestionEventData
): SSEQuestionEventData {
  return {
    fixedQId: api.fixed_q_id,
    qType: api.q_type,
    questionText: api.question_text,
    turnNum: api.turn_num,
    order: api.order,
    totalQuestions: api.total_questions,
  };
}

/** API SSE Continue 이벤트 -> 클라이언트 변환 */
export function toSSEContinueEventData(
  api: ApiSSEContinueEventData
): SSEContinueEventData {
  return {
    fixedQId: api.fixed_q_id,
    qType: api.q_type,
    questionText: api.question_text,
    turnNum: api.turn_num,
    order: api.order,
    totalQuestions: api.total_questions,
  };
}

/** API SSE Reaction 이벤트 -> 클라이언트 변환 */
export function toSSEReactionEventData(
  api: ApiSSEReactionEventData
): SSEReactionEventData {
  return {
    reactionText: api.reaction_text,
    turnNum: api.turn_num,
  };
}

/** API SSE GenerateTailComplete 이벤트 -> 클라이언트 변환 */
export function toSSEGenerateTailCompleteEventData(
  api: ApiSSEGenerateTailCompleteEventData
): SSEGenerateTailCompleteEventData {
  return {
    fixedQId: api.fixed_q_id,
    order: api.order,
    totalQuestions: api.total_questions,
  };
}
