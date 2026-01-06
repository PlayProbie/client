/**
 * 스트리밍 시그널 요청 API
 * POST /surveys/{surveyUuid}/signal
 */
import { fetchWithAuth } from '@/services/api-client';

import { API_BASE_URL } from '../constants';
import type {
  ApiSignalResponseWrapper,
  SignalRequest,
  SignalResponse,
} from '../types';
import { toSignalResponse } from '../types';

export async function postSurveySignal(
  surveyUuid: string,
  request: SignalRequest
): Promise<SignalResponse> {
  const response = await fetchWithAuth(
    `${API_BASE_URL}/surveys/${surveyUuid}/signal`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ signal_request: request.signalRequest }),
    }
  );

  if (!response.ok) {
    const errorData = await response.json().catch(() => null);
    throw new Error(errorData?.message || '스트리밍 연결에 실패했습니다.');
  }

  const data: ApiSignalResponseWrapper = await response.json();
  return toSignalResponse(data.result);
}
