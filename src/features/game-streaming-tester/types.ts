/**
 * Game Streaming Tester 타입 정의
 */

// ----------------------------------------
// Session Availability
// ----------------------------------------

export interface ApiSurveySessionAvailability {
  survey_uuid: string;
  game_name: string;
  is_available: boolean;
  stream_settings: {
    resolution: string;
    fps: number;
  };
}

export interface SurveySessionAvailability {
  surveyUuid: string;
  gameName: string;
  isAvailable: boolean;
  streamSettings: {
    resolution: string;
    fps: number;
  };
}

export interface ApiSurveySessionAvailabilityResponse {
  result: ApiSurveySessionAvailability;
}

export function toSurveySessionAvailability(
  api: ApiSurveySessionAvailability
): SurveySessionAvailability {
  return {
    surveyUuid: api.survey_uuid,
    gameName: api.game_name,
    isAvailable: api.is_available,
    streamSettings: {
      resolution: api.stream_settings.resolution,
      fps: api.stream_settings.fps,
    },
  };
}

// ----------------------------------------
// Signal
// ----------------------------------------

export interface SignalRequest {
  signalRequest: string;
}

export interface ApiSignalRequest {
  signal_request: string;
}

export interface ApiSignalResponse {
  signal_response: string;
  survey_session_uuid: string;
  expires_in_seconds: number;
}

export interface SignalResponse {
  signalResponse: string;
  surveySessionUuid: string;
  expiresInSeconds: number;
}

export interface ApiSignalResponseWrapper {
  result: ApiSignalResponse;
}

export function toSignalResponse(api: ApiSignalResponse): SignalResponse {
  return {
    signalResponse: api.signal_response,
    surveySessionUuid: api.survey_session_uuid,
    expiresInSeconds: api.expires_in_seconds,
  };
}

// ----------------------------------------
// Session Status
// ----------------------------------------

export interface ApiSurveySessionStatus {
  is_active: boolean;
  survey_session_uuid: string;
}

export interface SurveySessionStatus {
  isActive: boolean;
  surveySessionUuid: string;
}

export interface ApiSurveySessionStatusResponse {
  result: ApiSurveySessionStatus;
}

export function toSurveySessionStatus(
  api: ApiSurveySessionStatus
): SurveySessionStatus {
  return {
    isActive: api.is_active,
    surveySessionUuid: api.survey_session_uuid,
  };
}

// ----------------------------------------
// Terminate
// ----------------------------------------

export interface TerminateSurveySessionRequest {
  surveySessionUuid: string;
  reason?: 'user_exit' | 'timeout' | 'error';
}

export interface ApiTerminateSurveySessionRequest {
  survey_session_uuid: string;
  reason?: 'user_exit' | 'timeout' | 'error';
}

export interface ApiTerminateSurveySessionResponse {
  result: {
    success: boolean;
  };
}
