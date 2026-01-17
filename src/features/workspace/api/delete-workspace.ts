import { API_BASE_URL } from '@/constants/api';

/**
 * 워크스페이스 삭제
 * DELETE /workspaces/{workspaceUuid}
 */
export async function deleteWorkspace(workspaceUuid: string): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/workspaces/${workspaceUuid}`, {
    method: 'DELETE',
  });

  if (!response.ok) {
    if (response.status === 404) {
      throw new Error('워크스페이스를 찾을 수 없습니다.');
    }
    throw new Error('워크스페이스 삭제에 실패했습니다.');
  }
}
