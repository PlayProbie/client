import { API_BASE_URL } from '@/constants/api';

import { type ApiMembersListResponse } from '../types';

/**
 * 워크스페이스 멤버 목록 조회
 * GET /workspaces/{workspaceUuid}/members
 */
export async function getMembers(
  workspaceUuid: string
): Promise<ApiMembersListResponse> {
  const response = await fetch(
    `${API_BASE_URL}/workspaces/${workspaceUuid}/members`,
    {
      method: 'GET',
    }
  );

  if (!response.ok) {
    throw new Error('멤버 목록을 불러오는데 실패했습니다.');
  }

  return (await response.json()) as ApiMembersListResponse;
}
