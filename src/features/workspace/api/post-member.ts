import { API_BASE_URL } from '@/constants/api';

import {
  type ApiMemberResponse,
  type InviteMemberRequest,
  type Member,
  toApiInviteMemberRequest,
  toMember,
} from '../types';

export interface PostMemberInput {
  workspaceUuid: string;
  data: InviteMemberRequest;
}

/**
 * 워크스페이스 멤버 초대
 * POST /workspaces/{workspaceUuid}/members
 */
export async function postMember({
  workspaceUuid,
  data,
}: PostMemberInput): Promise<Member> {
  const response = await fetch(
    `${API_BASE_URL}/workspaces/${workspaceUuid}/members`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(toApiInviteMemberRequest(data)),
    }
  );

  if (!response.ok) {
    if (response.status === 404) {
      throw new Error('워크스페이스 또는 사용자를 찾을 수 없습니다.');
    }
    if (response.status === 409) {
      throw new Error('이미 워크스페이스 멤버입니다.');
    }
    throw new Error('멤버 초대에 실패했습니다.');
  }

  const json = (await response.json()) as ApiMemberResponse;
  return toMember(json.result);
}
