/**
 * Version Feature 타입 정의
 *
 * 명명 규칙:
 * - API 응답/요청 타입: snake_case (Api prefix)
 * - 클라이언트 상태 타입: camelCase
 */

// ----------------------------------------
// Version Types
// ----------------------------------------

/** 버전 상태 */
export type VersionStatus = 'stable' | 'beta' | 'legacy';

/** [API] Version 엔티티 */
export interface ApiVersion {
  version_uuid: string;
  game_uuid: string;
  version_name: string;
  description: string;
  status: VersionStatus;
  created_at: string;
  updated_at: string;
}

/** [Client] Version 엔티티 */
export interface Version {
  versionUuid: string;
  gameUuid: string;
  versionName: string;
  description: string;
  status: VersionStatus;
  createdAt: string;
  updatedAt: string;
}

/** [API] Version 생성 요청 */
export interface ApiCreateVersionRequest {
  version_name: string;
  description?: string;
  status?: VersionStatus;
}

/** [Client] Version 생성 요청 */
export interface CreateVersionRequest {
  versionName: string;
  description?: string;
  status?: VersionStatus;
}

// ----------------------------------------
// API Response Wrappers
// ----------------------------------------

/** [API] 버전 목록 응답 */
export interface ApiVersionsResponse {
  result: ApiVersion[];
}

/** [API] 버전 상세 응답 */
export interface ApiVersionResponse {
  result: ApiVersion;
}

// ----------------------------------------
// Transformers
// ----------------------------------------

/** ApiVersion → Version 변환 */
export function toVersion(api: ApiVersion): Version {
  return {
    versionUuid: api.version_uuid,
    gameUuid: api.game_uuid,
    versionName: api.version_name,
    description: api.description,
    status: api.status,
    createdAt: api.created_at,
    updatedAt: api.updated_at,
  };
}

/** CreateVersionRequest → ApiCreateVersionRequest 변환 */
export function toApiCreateVersionRequest(
  client: CreateVersionRequest
): ApiCreateVersionRequest {
  return {
    version_name: client.versionName,
    description: client.description,
    status: client.status,
  };
}
