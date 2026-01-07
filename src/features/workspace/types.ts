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

/** [API] PUT /workspaces/{uuid} Request */
export interface ApiUpdateWorkspaceRequest {
  name: string;
  description?: string;
  profile_image_url?: string;
}

/** [API] Workspace Response wrapper */
export interface ApiWorkspaceResponse {
  result: ApiWorkspace;
}

/** [API] Workspaces List Response wrapper */
export interface ApiWorkspacesListResponse {
  result: ApiWorkspace[];
}

/** [API] Member 엔티티 */
export interface ApiMember {
  memberId: number;
  userUuid: string;
  email: string;
  name: string;
  role: 'OWNER' | 'MEMBER';
  joined_at: string;
}

/** [API] POST /members Request (Invite) */
export interface ApiInviteMemberRequest {
  email: string;
}

/** [API] Member Response wrapper */
export interface ApiMemberResponse {
  result: ApiMember;
}

/** [API] Members List Response wrapper */
export interface ApiMembersListResponse {
  result: ApiMember[];
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

/** [Client] 워크스페이스 수정 요청 */
export interface UpdateWorkspaceRequest {
  name: string;
  description?: string;
  profileImageUrl?: string;
}

/** [Client] 멤버 엔티티 */
export interface Member {
  memberId: number;
  userUuid: string;
  email: string;
  name: string;
  role: 'OWNER' | 'MEMBER';
  joinedAt: string;
}

/** [Client] 멤버 초대 요청 */
export interface InviteMemberRequest {
  email: string;
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

/** UpdateWorkspaceRequest → ApiUpdateWorkspaceRequest 변환 */
export function toApiUpdateWorkspaceRequest(
  client: UpdateWorkspaceRequest
): ApiUpdateWorkspaceRequest {
  return {
    name: client.name,
    description: client.description,
    profile_image_url: client.profileImageUrl,
  };
}

/** ApiMember → Member 변환 */
export function toMember(api: ApiMember): Member {
  return {
    memberId: api.memberId,
    userUuid: api.userUuid,
    email: api.email,
    name: api.name,
    role: api.role,
    joinedAt: api.joined_at,
  };
}

/** InviteMemberRequest → ApiInviteMemberRequest 변환 */
export function toApiInviteMemberRequest(
  client: InviteMemberRequest
): ApiInviteMemberRequest {
  return {
    email: client.email,
  };
}
