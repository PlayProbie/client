/**
 * Workspace API - 워크스페이스 생성
 * POST /workspaces
 */
import { API_BASE_URL } from '@/constants/api';

import type {
  ApiWorkspaceResponse,
  CreateWorkspaceRequest,
  Workspace,
} from '../types';
import { toApiCreateWorkspaceRequest, toWorkspace } from '../types';

/** 워크스페이스 생성 */
export async function postWorkspace(
  data: CreateWorkspaceRequest
): Promise<Workspace> {
  const body = toApiCreateWorkspaceRequest(data);

  const response = await fetch(`${API_BASE_URL}/workspaces`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    if (response.status === 400) {
      throw new Error('잘못된 요청입니다.');
    }
    throw new Error('워크스페이스 생성에 실패했습니다.');
  }

  const result: ApiWorkspaceResponse = await response.json();
  return toWorkspace(result.result);
}
