/**
 * Game Streaming Session Feature 타입 정의
 *
 * Phase 4-5: Tester 스트리밍 API (세션 관련만)
 *
 * 명명 규칙:
 * - API 응답/요청 타입: snake_case (Api prefix)
 * - 클라이언트 상태 타입: camelCase
 */

// ----------------------------------------
// Session Types (Tester API)
// ----------------------------------------

/** Stream Settings (Tester용) */
export interface StreamSettingsInfo {
  resolution: string;
  fps: number;
}

/** [API] 세션 정보 응답 */
export interface ApiSessionInfoResponse {
  result: {
    survey_uuid: string;
    game_name: string;
    is_available: boolean;
    wait_time_seconds?: number;
    queue_position?: number;
    stream_settings?: {
      resolution: string;
      fps: number;
    } | null;
  };
}

/** [Client] 세션 정보 */
export interface SessionInfo {
  surveyUuid: string;
  gameName: string;
  isAvailable: boolean;
  waitTimeSeconds: number;
  queuePosition: number;
  streamSettings: StreamSettingsInfo | null;
}

// ----------------------------------------
// Signal Types (WebRTC)
// ----------------------------------------

/** [API] 시그널 요청 */
export interface ApiSignalRequest {
  signal_request: string;
}

/** [API] 시그널 응답 */
export interface ApiSignalResponse {
  result: {
    signal_response: string;
    survey_session_uuid: string;
    expires_in_seconds: number;
  };
}

/** [Client] 시그널 요청 */
export interface SignalRequest {
  signalRequest: string;
}

/** [Client] 시그널 응답 */
export interface SignalResponse {
  signalResponse: string;
  surveySessionUuid: string;
  expiresInSeconds: number;
}

// ----------------------------------------
// Session Status Types (Heartbeat)
// ----------------------------------------

/** [API] 세션 상태 응답 */
export interface ApiSessionStatusResponse {
  result: {
    survey_session_uuid?: string;
    is_active: boolean;
  };
}

/** [Client] 세션 상태 */
export interface SessionStatus {
  isActive: boolean;
  surveySessionUuid: string;
}

// ----------------------------------------
// Terminate Types
// ----------------------------------------

/** 종료 사유 */
export type TerminateReason = 'USER_EXIT' | 'TIMEOUT' | 'ERROR';

/** [API] 세션 종료 요청 */
export interface ApiTerminateRequest {
  survey_session_uuid: string;
  reason?: TerminateReason;
}

/** [API] 세션 종료 응답 */
export interface ApiTerminateResponse {
  result: {
    success: boolean;
  };
}

/** [Client] 세션 종료 요청 */
export interface TerminateRequest {
  surveySessionUuid: string;
  reason?: TerminateReason;
}

/** [Client] 세션 종료 응답 */
export interface TerminateResponse {
  success: boolean;
}

// ----------------------------------------
// Transformers
// ----------------------------------------

/** ApiSessionInfoResponse → SessionInfo 변환 */
export function toSessionInfo(
  api: ApiSessionInfoResponse['result']
): SessionInfo {
  return {
    surveyUuid: api.survey_uuid,
    gameName: api.game_name,
    isAvailable: api.is_available,
    waitTimeSeconds: api.wait_time_seconds ?? 0,
    queuePosition: api.queue_position ?? 0,
    streamSettings: api.stream_settings
      ? {
          resolution: api.stream_settings.resolution,
          fps: api.stream_settings.fps,
        }
      : null,
  };
}

/** ApiSignalResponse → SignalResponse 변환 */
export function toSignalResponse(
  api: ApiSignalResponse['result']
): SignalResponse {
  return {
    signalResponse: api.signal_response,
    surveySessionUuid: api.survey_session_uuid,
    expiresInSeconds: api.expires_in_seconds,
  };
}

/** SignalRequest → ApiSignalRequest 변환 */
export function toApiSignalRequest(client: SignalRequest): ApiSignalRequest {
  return {
    signal_request: client.signalRequest,
  };
}

/** ApiSessionStatusResponse → SessionStatus 변환 */
export function toSessionStatus(
  api: ApiSessionStatusResponse['result']
): SessionStatus {
  return {
    isActive: api.is_active,
    surveySessionUuid: api.survey_session_uuid ?? '',
  };
}

/** TerminateRequest → ApiTerminateRequest 변환 */
export function toApiTerminateRequest(
  client: TerminateRequest
): ApiTerminateRequest {
  return {
    survey_session_uuid: client.surveySessionUuid,
    reason: client.reason,
  };
}

/** ApiTerminateResponse → TerminateResponse 변환 */
export function toTerminateResponse(
  api: ApiTerminateResponse['result']
): TerminateResponse {
  return {
    success: api.success,
  };
}
