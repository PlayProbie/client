/**
 * Build Complete API
 * POST /games/{gameUuid}/builds/{buildUuid}/complete
 *
 * Spring GameBuildApi.completeUpload 연동
 */
import { fetchWithAuth } from '@/services/api-client';

import { API_BASE_URL, BUILD_ERROR_MESSAGES } from '../constants';
import type {
  ApiBuildCompleteRequest,
  ApiBuildCompleteResponse,
} from '../types';

/** 빌드 업로드 완료 처리 */
export async function postBuildComplete(
  gameUuid: string,
  buildUuid: string,
  request: ApiBuildCompleteRequest
): Promise<ApiBuildCompleteResponse> {
  const response = await fetchWithAuth(
    `${API_BASE_URL}/games/${gameUuid}/builds/${buildUuid}/complete`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(request),
    }
  );

  if (!response.ok) {
    const errorData = await response.json().catch(() => null);
    const errorCode = errorData?.code;
    const message =
      BUILD_ERROR_MESSAGES[errorCode] ||
      errorData?.message ||
      '빌드 완료 처리에 실패했습니다.';

    const error = new Error(message);
    (error as Error & { code?: string }).code = errorCode;
    throw error;
  }

  return response.json();
}
