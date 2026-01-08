import { API_BASE_URL } from '@/constants/api';

/**
 * 워크스페이스 멤버 내보내기/삭제
 * DELETE /workspaces/{workspaceUuid}/members/{userId}
 */
export async function deleteMember(
  workspaceUuid: string,
  userId: number
): Promise<void> {
  const response = await fetch(
    `${API_BASE_URL}/workspaces/${workspaceUuid}/members/${userId}`,
    {
      method: 'DELETE',
    }
  );

  if (!response.ok) {
    if (response.status === 403) {
      throw new Error('멤버를 내보낼 권한이 없습니다.');
    }
    throw new Error('멤버 내보내기에 실패했습니다.');
  }
}
