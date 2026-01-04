/**
 * Build Complete API
 * POST /streaming-games/{gameUuid}/builds/{buildId}/complete
 */
import { API_BASE_URL, BUILD_ERROR_MESSAGES } from '../constants';
import type {
  ApiBuildCompleteRequest,
  ApiBuildCompleteResponse,
  BuildStatus,
} from '../types';

/** 빌드 업로드 완료 처리 */
export async function postBuildComplete(
  gameUuid: string,
  buildId: string,
  request: ApiBuildCompleteRequest
): Promise<BuildStatus> {
  const response = await fetch(
    `${API_BASE_URL}/streaming-games/${gameUuid}/builds/${buildId}/complete`,
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

  const data: ApiBuildCompleteResponse = await response.json();
  return data.status;
}
