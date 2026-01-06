/**
 * Workspace Feature 타입 정의
 *
 * 명명 규칙:
 * - API 응답/요청 타입: snake_case (서버 응답 그대로)
 * - 클라이언트 상태 타입: camelCase (컴포넌트에서 사용)
 */

// ----------------------------------------
// API Request/Response Types (snake_case)
// ----------------------------------------

/** [API] Workspace 엔티티 */
export interface ApiWorkspace {
  workspace_uuid: string;
  name: string;
  profile_image_url: string | null;
  description: string | null;
  game_count: number;
  created_at: string;
  updated_at: string;
}

/** [API] POST /workspaces Request */
export interface ApiCreateWorkspaceRequest {
  name: string;
  description?: string;
}

/** [API] Workspace Response wrapper */
export interface ApiWorkspaceResponse {
  result: ApiWorkspace;
}

/** [API] Workspaces List Response wrapper */
export interface ApiWorkspacesListResponse {
  result: ApiWorkspace[];
}

// ----------------------------------------
// Client State Types (camelCase)
// ----------------------------------------

/** [Client] 워크스페이스 엔티티 */
export interface Workspace {
  workspaceUuid: string;
  name: string;
  profileImageUrl: string | null;
  description: string | null;
  gameCount: number;
  createdAt: string;
  updatedAt: string;
}

/** [Client] 워크스페이스 생성 요청 */
export interface CreateWorkspaceRequest {
  name: string;
  description?: string;
}

// ----------------------------------------
// Transformers
// ----------------------------------------

/** ApiWorkspace → Workspace 변환 */
export function toWorkspace(api: ApiWorkspace): Workspace {
  return {
    workspaceUuid: api.workspace_uuid,
    name: api.name,
    profileImageUrl: api.profile_image_url,
    description: api.description,
    gameCount: api.game_count,
    createdAt: api.created_at,
    updatedAt: api.updated_at,
  };
}

/** CreateWorkspaceRequest → ApiCreateWorkspaceRequest 변환 */
export function toApiCreateWorkspaceRequest(
  client: CreateWorkspaceRequest
): ApiCreateWorkspaceRequest {
  return {
    name: client.name,
    description: client.description,
  };
}
