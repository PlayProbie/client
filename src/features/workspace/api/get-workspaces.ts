/**
 * Workspace API - 워크스페이스 목록 조회
 * GET /workspaces
 */
import { API_BASE_URL } from '@/constants/api';

import type { ApiWorkspacesListResponse, Workspace } from '../types';
import { toWorkspace } from '../types';

/** 현재 사용자의 워크스페이스 목록 조회 */
export async function getWorkspaces(): Promise<Workspace[]> {
  const response = await fetch(`${API_BASE_URL}/workspaces`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error('워크스페이스 목록을 불러오는데 실패했습니다.');
  }

  const data: ApiWorkspacesListResponse = await response.json();
  return data.result.map(toWorkspace);
}
