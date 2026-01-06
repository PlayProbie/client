/**
 * 스트리밍 리소스 생성 API
 * POST /surveys/{surveyUuid}/streaming-resource
 */
import { fetchWithAuth } from '@/services/api-client';

import { API_BASE_URL, ERROR_MESSAGES } from '../constants';
import type {
  ApiStreamingResourceResponse,
  CreateStreamingResourceRequest,
  StreamingResource,
} from '../types';
import {
  toApiCreateStreamingResourceRequest,
  toStreamingResource,
} from '../types';

/** 스트리밍 리소스 생성 (빌드 연결) */
export async function createStreamingResource(
  surveyUuid: string,
  request: CreateStreamingResourceRequest
): Promise<StreamingResource> {
  const response = await fetchWithAuth(
    `${API_BASE_URL}/surveys/${surveyUuid}/streaming-resource`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(toApiCreateStreamingResourceRequest(request)),
    }
  );

  if (!response.ok) {
    const errorData = await response.json().catch(() => null);
    const errorCode = errorData?.code;
    const message =
      ERROR_MESSAGES[errorCode] ||
      errorData?.message ||
      '스트리밍 리소스 생성에 실패했습니다.';
    throw new Error(message);
  }

  const data: ApiStreamingResourceResponse = await response.json();
  return toStreamingResource(data.result);
}
