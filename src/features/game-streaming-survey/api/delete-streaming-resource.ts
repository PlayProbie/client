/**
 * 스트리밍 리소스 삭제 API
 * DELETE /surveys/{surveyUuid}/streaming-resource
 */
import { fetchWithAuth } from '@/services/api-client';

import { API_BASE_URL } from '../constants';

/** 스트리밍 리소스 삭제 (연결 해제) */
export async function deleteStreamingResource(
  surveyUuid: string
): Promise<void> {
  const response = await fetchWithAuth(
    `${API_BASE_URL}/surveys/${surveyUuid}/streaming-resource`,
    { method: 'DELETE' }
  );

  if (!response.ok) {
    throw new Error('스트리밍 리소스 연결 해제에 실패했습니다.');
  }
}
