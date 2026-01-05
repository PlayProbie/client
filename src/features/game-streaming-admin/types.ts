/**
 * Game Streaming Admin Feature 타입 정의
 *
 * Phase 3: 관리자 테스트 (0 ↔ 1)
 *
 * 명명 규칙:
 * - API 응답/요청 타입: snake_case (Api prefix)
 * - 클라이언트 상태 타입: camelCase
 */

// ----------------------------------------
// Admin Test Types
// ----------------------------------------

/** 관리자 테스트 상태 */
export type AdminTestStatus = 'READY' | 'TESTING';

/** [API] 테스트 시작/종료 응답 */
export interface ApiAdminTestResponse {
  result: {
    status: AdminTestStatus;
    current_capacity: number;
  };
}

/** [Client] 테스트 결과 */
export interface AdminTestResult {
  status: AdminTestStatus;
  currentCapacity: number;
}

// ----------------------------------------
// Resource Status Types
// ----------------------------------------

/** [API] 리소스 상태 조회 응답 */
export interface ApiResourceStatusResponse {
  result: {
    status: AdminTestStatus;
    current_capacity: number;
    instances_ready: boolean;
  };
}

/** [Client] 리소스 상태 */
export interface ResourceStatus {
  status: AdminTestStatus;
  currentCapacity: number;
  instancesReady: boolean;
}

// ----------------------------------------
// Transformers
// ----------------------------------------

/** ApiAdminTestResponse → AdminTestResult 변환 */
export function toAdminTestResult(
  api: ApiAdminTestResponse['result']
): AdminTestResult {
  return {
    status: api.status,
    currentCapacity: api.current_capacity,
  };
}

/** ApiResourceStatusResponse → ResourceStatus 변환 */
export function toResourceStatus(
  api: ApiResourceStatusResponse['result']
): ResourceStatus {
  return {
    status: api.status,
    currentCapacity: api.current_capacity,
    instancesReady: api.instances_ready,
  };
}
