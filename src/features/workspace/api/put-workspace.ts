import { API_BASE_URL } from '@/constants/api';

import {
  type ApiWorkspaceResponse,
  toApiUpdateWorkspaceRequest,
  toWorkspace,
  type UpdateWorkspaceRequest,
  type Workspace,
} from '../types';

export interface PutWorkspaceInput {
  workspaceUuid: string;
  data: UpdateWorkspaceRequest;
}

/**
 * 워크스페이스 수정
 * PUT /workspaces/{workspaceUuid}
 */
export async function putWorkspace({
  workspaceUuid,
  data,
}: PutWorkspaceInput): Promise<Workspace> {
  const response = await fetch(`${API_BASE_URL}/workspaces/${workspaceUuid}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(toApiUpdateWorkspaceRequest(data)),
  });

  if (!response.ok) {
    if (response.status === 404) {
      throw new Error('워크스페이스를 찾을 수 없습니다.');
    }
    throw new Error('워크스페이스 수정에 실패했습니다.');
  }

  const json = (await response.json()) as ApiWorkspaceResponse;
  return toWorkspace(json.result);
}
