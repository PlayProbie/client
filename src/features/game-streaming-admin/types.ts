/**
 * Game Streaming Admin Feature 타입 정의
 *
 * Phase 3: 관리자 테스트 (0 ↔ 1)
 *
 * 명명 규칙:
 * - API 응답/요청 타입: snake_case (Api prefix)
 * - 클라이언트 상태 타입: camelCase
 */

import type { StreamingResourceStatus } from '@/features/game-streaming-survey';

// ----------------------------------------
// Admin Test Types
// ----------------------------------------

/** [API] 테스트 시작/종료 응답 */
export interface ApiAdminTestResponse {
  result: {
    status: StreamingResourceStatus;
    current_capacity: number;
    message: string;
  };
}

/** [Client] 테스트 결과 */
export interface AdminTestResult {
  status: StreamingResourceStatus;
  currentCapacity: number;
  message: string;
}

// ----------------------------------------
// Resource Status Types
// ----------------------------------------

/** [API] 리소스 상태 조회 응답 */
export interface ApiResourceStatusResponse {
  result: {
    status: StreamingResourceStatus;
    current_capacity: number;
    instances_ready: boolean;
  };
}

/** [Client] 리소스 상태 */
export interface ResourceStatus {
  status: StreamingResourceStatus;
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
    message: api.message,
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
