/**
 * 설문 세션 종료 API
 * POST /surveys/{surveyUuid}/session/terminate
 */
import { fetchWithAuth } from '@/services/api-client';

import { API_BASE_URL } from '../constants';
import type {
  ApiTerminateSurveySessionResponse,
  TerminateSurveySessionRequest,
} from '../types';

export async function terminateSurveySession(
  surveyUuid: string,
  request: TerminateSurveySessionRequest
): Promise<boolean> {
  const response = await fetchWithAuth(
    `${API_BASE_URL}/surveys/${surveyUuid}/session/terminate`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        survey_session_uuid: request.surveySessionUuid,
        reason: request.reason,
      }),
    }
  );

  if (!response.ok) {
    const errorData = await response.json().catch(() => null);
    throw new Error(errorData?.message || '세션 종료에 실패했습니다.');
  }

  const data: ApiTerminateSurveySessionResponse = await response.json();
  return data.result.success;
}
