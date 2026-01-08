/**
 * 세션 종료 API
 * POST /surveys/{surveyUuid}/session/terminate
 */

import { API_BASE_URL } from '../constants';
import type {
  ApiTerminateResponse,
  TerminateRequest,
  TerminateResponse,
} from '../types';
import { toApiTerminateRequest, toTerminateResponse } from '../types';

/** 세션 종료 */
export async function postTerminate(
  surveyUuid: string,
  request: TerminateRequest
): Promise<TerminateResponse> {
  const response = await fetch(
    `${API_BASE_URL}/surveys/${surveyUuid}/session/terminate`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(toApiTerminateRequest(request)),
    }
  );

  if (!response.ok) {
    const errorData = await response.json().catch(() => null);
    throw new Error(errorData?.message || '세션 종료에 실패했습니다.');
  }

  const data: ApiTerminateResponse = await response.json();
  return toTerminateResponse(data.result);
}
