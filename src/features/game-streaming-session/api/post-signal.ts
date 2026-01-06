/**
 * WebRTC 시그널 교환 API
 * POST /surveys/{surveyUuid}/signal
 */

import { API_BASE_URL } from '../constants';
import type {
  ApiSignalResponse,
  SignalRequest,
  SignalResponse,
} from '../types';
import { toApiSignalRequest, toSignalResponse } from '../types';

/** WebRTC 시그널 요청 */
export async function postSignal(
  surveyUuid: string,
  request: SignalRequest
): Promise<SignalResponse> {
  const response = await fetch(
    `${API_BASE_URL}/surveys/${surveyUuid}/signal`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(toApiSignalRequest(request)),
    }
  );

  if (!response.ok) {
    const errorData = await response.json().catch(() => null);
    throw new Error(errorData?.message || '시그널 교환에 실패했습니다.');
  }

  const data: ApiSignalResponse = await response.json();
  return toSignalResponse(data.result);
}
