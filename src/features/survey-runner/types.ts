/**
 * Survey Runner Feature 타입 정의
 * 설문 진행(채팅) 관련 API 타입
 */

// ----------------------------------------
// Common Types
// ----------------------------------------

/** 설문 세션 상태 */
export type SurveySessionStatus = 'IN_PROGRESS' | 'COMPLETED' | 'DROPPED';

/** 인터뷰 로그 질문 타입 */
export type InterviewLogQType = 'FIXED' | 'TAIL';

/** 채팅 세션 정보 */
export interface ChatSession {
  session_id: string;
  survey_id: number;
  tester_id: string;
  status: SurveySessionStatus;
}

/** 대화 발췌 (히스토리 아이템) */
export interface ChatExcerpt {
  turn_num: number;
  q_type: InterviewLogQType;
  question_text: string;
  answer_text: string | null;
}

/** 저장된 대화 로그 */
export interface SavedChatLog {
  turn_num: number;
  q_type: InterviewLogQType;
  fixed_q_id: number;
  question_text: string;
  answer_text: string;
  answered_at: string;
}

// ----------------------------------------
// POST /interview/{survey_id} - 새 대화 세션 생성
// ----------------------------------------

/** 새 대화 세션 생성 요청 파라미터 */
export interface CreateChatSessionParams {
  surveyId: number;
}

/** 새 대화 세션 생성 결과 데이터 */
export interface CreateChatSessionResult {
  session: ChatSession;
  sse_url: string;
}

/** POST /surveys/chat/{survey_id} Response */
export interface CreateChatSessionResponse {
  result: CreateChatSessionResult;
}

// ----------------------------------------
// GET /interview/{survey_id}/{session_id} - 대화 세션 복원
// ----------------------------------------

/** 대화 세션 복원 요청 파라미터 */
export interface RestoreChatSessionParams {
  surveyId: number;
  sessionId: string;
}

/** 대화 세션 복원 결과 데이터 */
export interface RestoreChatSessionResult {
  session: ChatSession;
  excerpts: ChatExcerpt[];
  sse_url: string;
}

/** GET /surveys/chat/{survey_id}/{session_id} Response */
export interface RestoreChatSessionResponse {
  result: RestoreChatSessionResult;
}

// ----------------------------------------
// SSE Events - GET /interview/{session_id}/stream
// ----------------------------------------

/** SSE 이벤트 타입 */
export type SSEEventType = 'question' | 'info' | 'done' | 'error';

/** SSE Question 이벤트 데이터 */
export interface SSEQuestionEventData {
  fixed_q_id: number;
  q_type: InterviewLogQType;
  question_text: string;
  turn_num: number;
}

/** SSE Info 이벤트 데이터 */
export interface SSEInfoEventData {
  message: string;
}

/** SSE Error 이벤트 데이터 */
export interface SSEErrorEventData {
  code: string;
  message: string;
}

/** SSE 이벤트 (유니온 타입) */
export type SSEEvent =
  | { event: 'question'; data: SSEQuestionEventData }
  | { event: 'info'; data: SSEInfoEventData }
  | { event: 'done'; data?: undefined }
  | { event: 'error'; data: SSEErrorEventData };

// ----------------------------------------
// POST /interview/{session_id}/messages - 응답자 대답 전송
// ----------------------------------------

/** 응답자 대답 전송 요청 파라미터 */
export interface SendMessageParams {
  sessionId: string;
}

/** 응답자 대답 전송 요청 바디 */
export interface SendMessageRequest {
  turn_num: number;
  answer_text: string;
}

/** 응답자 대답 전송 결과 데이터 */
export interface SendMessageResult {
  accepted: boolean;
  saved_log: SavedChatLog;
}

/** POST /interview/{session_id}/messages Response */
export interface SendMessageResponse {
  result: SendMessageResult;
}

// ----------------------------------------
// Client-side State Types
// ----------------------------------------

/** 채팅 메시지 데이터 (클라이언트 상태) */
export interface ChatMessageData {
  id: string;
  type: 'ai' | 'user';
  content: string;
  turnNum: number;
  qType?: InterviewLogQType;
  fixedQId?: number;
  timestamp: Date;
}

// ----------------------------------------
// Hook Types
// ----------------------------------------

/** useChatSSE 훅 옵션 */
export interface UseChatSSEOptions {
  sessionId: string;
  onQuestion: (data: SSEQuestionEventData) => void;
  onInfo?: (message: string) => void;
  onDone?: () => void;
  onError?: (error: string) => void;
  onConnect?: () => void;
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
  sessionId: string;
  surveyId?: number;
}

/** useChatSession 훅 반환 타입 */
export interface UseChatSessionReturn {
  isReady: boolean;
  isComplete: boolean;
  isLoading: boolean;
  error: string | null;
  messages: ChatMessageData[];
  currentTurnNum: number;
  sendAnswer: (answerText: string) => Promise<void>;
}
