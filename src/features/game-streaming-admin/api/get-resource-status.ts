/**
 * 리소스 상태 조회 API
 * GET /surveys/{surveyId}/streaming-resource/status
 */
import { API_BASE_URL } from '../constants';
import type { ApiResourceStatusResponse, ResourceStatus } from '../types';
import { toResourceStatus } from '../types';

/** 리소스 상태 조회 */
export async function getResourceStatus(
  surveyId: number
): Promise<ResourceStatus> {
  const response = await fetch(
    `${API_BASE_URL}/surveys/${surveyId}/streaming-resource/status`,
    { method: 'GET' }
  );

  if (!response.ok) {
    throw new Error('리소스 상태를 불러오는데 실패했습니다.');
  }

  const data: ApiResourceStatusResponse = await response.json();
  return toResourceStatus(data.result);
}
