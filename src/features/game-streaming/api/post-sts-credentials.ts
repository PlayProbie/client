/**
 * STS Credentials 발급 API
 * POST /streaming-games/{gameUuid}/builds/sts-credentials
 */
import { API_BASE_URL } from '../constants';
import type {
  ApiStsCredentialsRequest,
  ApiStsCredentialsResponse,
  StsCredentialsResponse,
} from '../types';
import { toStsCredentialsResponse } from '../types';

/** STS 임시 자격 증명 발급 요청 */
export async function postStsCredentials(
  gameUuid: string,
  request: ApiStsCredentialsRequest
): Promise<StsCredentialsResponse> {
  const response = await fetch(
    `${API_BASE_URL}/streaming-games/${gameUuid}/builds/sts-credentials`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(request),
    }
  );

  if (!response.ok) {
    const errorData = await response.json().catch(() => null);
    throw new Error(
      errorData?.message || '업로드 인증 정보 발급에 실패했습니다.'
    );
  }

  const data: ApiStsCredentialsResponse = await response.json();
  return toStsCredentialsResponse(data);
}
