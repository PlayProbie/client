import { API_BASE_URL } from '@/constants/api';

import {
  type ApiWorkspaceResponse,
  toWorkspace,
  type Workspace,
} from '../types';

/**
 * 워크스페이스 상세 조회
 * GET /workspaces/{workspaceUuid}
 */
export async function getWorkspace(workspaceUuid: string): Promise<Workspace> {
  const response = await fetch(`${API_BASE_URL}/workspaces/${workspaceUuid}`, {
    method: 'GET',
  });

  if (!response.ok) {
    if (response.status === 404) {
      throw new Error('워크스페이스를 찾을 수 없습니다.');
    }
    throw new Error('워크스페이스 조회에 실패했습니다.');
  }

  const json = (await response.json()) as ApiWorkspaceResponse;
  return toWorkspace(json.result);
}
