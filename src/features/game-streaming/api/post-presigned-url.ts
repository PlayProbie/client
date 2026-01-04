/**
 * Presigned URL 발급 API
 * POST /streaming-games/{gameUuid}/builds/presigned-url
 */
import { API_BASE_URL } from '../constants';
import type {
  ApiPresignedUrlRequest,
  ApiPresignedUrlResponse,
  PresignedUrlResponse,
} from '../types';
import { toPresignedUrlResponse } from '../types';

/** Presigned URL 발급 요청 */
export async function postPresignedUrl(
  gameUuid: string,
  request: ApiPresignedUrlRequest
): Promise<PresignedUrlResponse> {
  const response = await fetch(
    `${API_BASE_URL}/streaming-games/${gameUuid}/builds/presigned-url`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(request),
    }
  );

  if (!response.ok) {
    const errorData = await response.json().catch(() => null);
    throw new Error(errorData?.message || '업로드 URL 발급에 실패했습니다.');
  }

  const data: ApiPresignedUrlResponse = await response.json();
  return toPresignedUrlResponse(data);
}
