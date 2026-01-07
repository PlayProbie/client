/**
 * Game Streaming Survey Feature 타입 정의
 *
 * Phase 2: 설문 & 리소스 할당 (JIT Provisioning)
 *
 * 명명 규칙:
 * - API 응답/요청 타입: snake_case (Api prefix)
 * - 클라이언트 상태 타입: camelCase
 */

// ----------------------------------------
// Survey Types
// ----------------------------------------

/** 설문 상태 */
export type SurveyStatus = 'DRAFT' | 'ACTIVE' | 'CLOSED';

/** [API] Survey 엔티티 (목록용) */
export interface ApiSurvey {
  survey_uuid: string;
  survey_name: string;
  status: SurveyStatus;
  created_at: string;
}

/** [Client] Survey 엔티티 */
export interface Survey {
  surveyUuid: string;
  surveyName: string;
  status: SurveyStatus;
  createdAt: string;
}

/** 설문 통계 */
export interface SurveyStats {
  totalSurveys: number;
  activeSurveys: number;
  draftSurveys: number;
  latestLabel: string;
}

// ----------------------------------------
// Streaming Resource Types
// ----------------------------------------

/** 스트리밍 리소스 상태 */
export type StreamingResourceStatus =
  | 'CREATING'
  | 'PENDING'
  | 'PROVISIONING'
  | 'READY'
  | 'TESTING'
  | 'SCALING'
  | 'ACTIVE'
  | 'CLEANING'
  | 'TERMINATED';

/** [API] Streaming Resource 엔티티 */
export interface ApiStreamingResource {
  uuid: string;
  status: StreamingResourceStatus;
  current_capacity: number;
  max_capacity: number;
  instance_type: string;
  created_at: string;
}

/** [Client] Streaming Resource 엔티티 */
export interface StreamingResource {
  uuid: string;
  status: StreamingResourceStatus;
  currentCapacity: number;
  maxCapacity: number;
  instanceType: string;
  createdAt: string;
}

/** [API] Streaming Resource 생성 요청 */
export interface ApiCreateStreamingResourceRequest {
  build_uuid: string;
  instance_type: string;
  max_capacity: number;
}

/** [Client] Streaming Resource 생성 요청 */
export interface CreateStreamingResourceRequest {
  buildUuid: string;
  instanceType: string;
  maxCapacity: number;
}

// ----------------------------------------
// API Response Wrappers
// ----------------------------------------

/** [API] 설문 목록 응답 */
export interface ApiSurveysResponse {
  result: ApiSurvey[];
}

/** [API] 스트리밍 리소스 응답 */
export interface ApiStreamingResourceResponse {
  result: ApiStreamingResource;
}

// ----------------------------------------
// Transformers
// ----------------------------------------

/** ApiSurvey → Survey 변환 */
export function toSurvey(api: ApiSurvey): Survey {
  return {
    surveyUuid: api.survey_uuid,
    surveyName: api.survey_name,
    status: api.status,
    createdAt: api.created_at,
  };
}

/** ApiStreamingResource → StreamingResource 변환 */
export function toStreamingResource(
  api: ApiStreamingResource
): StreamingResource {
  return {
    uuid: api.uuid,
    status: api.status,
    currentCapacity: api.current_capacity,
    maxCapacity: api.max_capacity,
    instanceType: api.instance_type,
    createdAt: api.created_at,
  };
}

/** CreateStreamingResourceRequest → ApiCreateStreamingResourceRequest 변환 */
export function toApiCreateStreamingResourceRequest(
  client: CreateStreamingResourceRequest
): ApiCreateStreamingResourceRequest {
  return {
    build_uuid: client.buildUuid,
    instance_type: client.instanceType,
    max_capacity: client.maxCapacity,
  };
}

// ----------------------------------------
// Survey Status Update Types (Phase 4-5)
// ----------------------------------------

/** 설문 상태 변경 요청값 */
export type SurveyStatusValue = 'ACTIVE' | 'CLOSED';

/** [API] 스트리밍 리소스 상태 (상태 변경 응답용) */
export interface ApiStreamingResourceStatusInfo {
  status: StreamingResourceStatus;
  current_capacity: number;
  message?: string;
}

/** [API] 설문 상태 변경 응답 */
export interface ApiUpdateSurveyStatusResponse {
  result: {
    survey_uuid: string;
    status: SurveyStatusValue;
    streaming_resource?: ApiStreamingResourceStatusInfo;
  };
}

/** [Client] 설문 상태 변경 응답 */
export interface UpdateSurveyStatusResponse {
  surveyUuid: string;
  status: SurveyStatusValue;
  streamingResource?: {
    status: StreamingResourceStatus;
    currentCapacity: number;
    message?: string;
  };
}

/** ApiUpdateSurveyStatusResponse → UpdateSurveyStatusResponse 변환 */
export function toUpdateSurveyStatusResponse(
  api: ApiUpdateSurveyStatusResponse['result']
): UpdateSurveyStatusResponse {
  return {
    surveyUuid: api.survey_uuid,
    status: api.status,
    streamingResource: api.streaming_resource
      ? {
          status: api.streaming_resource.status,
          currentCapacity: api.streaming_resource.current_capacity,
          message: api.streaming_resource.message,
        }
      : undefined,
  };
}
