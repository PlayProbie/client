/**
 * Presigned URL 발급 API
 * POST /sessions/{sessionId}/replay/presigned-url
 */

import { API_BASE_URL } from '../constants';
import type { ApiPresignedUrlRequest } from '../types';
import { toPresignedUrl } from '../types';

export async function postPresignedUrl(
  sessionId: string,
  request: ApiPresignedUrlRequest,
  authToken?: string
): Promise<{ segmentId: string; s3Url: string; expiresIn: number }> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (authToken) {
    headers['Authorization'] = `Bearer ${authToken}`;
  }

  const response = await fetch(
    `${API_BASE_URL}/sessions/${sessionId}/replay/presigned-url`,
    {
      method: 'POST',
      headers,
      body: JSON.stringify(request),
    }
  );

  if (!response.ok) {
    const errorData = await response.json().catch(() => null);
    throw new Error(errorData?.message || 'Presigned URL 발급에 실패했습니다.');
  }

  const data = await response.json();
  const resultData = data.result || data.data;
  if (!resultData) {
    throw new Error('Invalid API response structure: missing result or data');
  }

  return toPresignedUrl(resultData);
}
