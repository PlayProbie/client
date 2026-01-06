/**
 * 스트리밍 리소스 조회 API
 * GET /surveys/{surveyUuid}/streaming-resource
 */
import { fetchWithAuth } from '@/services/api-client';

import { API_BASE_URL } from '../constants';
import type { ApiStreamingResourceResponse, StreamingResource } from '../types';
import { toStreamingResource } from '../types';

/** 스트리밍 리소스 조회 */
export async function getStreamingResource(
  surveyUuid: string
): Promise<StreamingResource | null> {
  const response = await fetchWithAuth(
    `${API_BASE_URL}/surveys/${surveyUuid}/streaming-resource`,
    { method: 'GET' }
  );

  // 404는 리소스가 없는 경우
  if (response.status === 404) {
    return null;
  }

  if (!response.ok) {
    throw new Error('스트리밍 리소스를 불러오는데 실패했습니다.');
  }

  const data: ApiStreamingResourceResponse = await response.json();
  return toStreamingResource(data.result);
}
