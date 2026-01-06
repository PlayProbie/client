/**
 * 설문 세션 상태 조회 API
 * GET /surveys/{surveyUuid}/session/status
 */
import { fetchWithAuth } from '@/services/api-client';

import { API_BASE_URL } from '../constants';
import type {
  ApiSurveySessionStatusResponse,
  SurveySessionStatus,
} from '../types';
import { toSurveySessionStatus } from '../types';

export async function getSurveySessionStatus(
  surveyUuid: string
): Promise<SurveySessionStatus> {
  const response = await fetchWithAuth(
    `${API_BASE_URL}/surveys/${surveyUuid}/session/status`,
    { method: 'GET' }
  );

  if (!response.ok) {
    throw new Error('세션 상태를 불러오지 못했습니다.');
  }

  const data: ApiSurveySessionStatusResponse = await response.json();
  return toSurveySessionStatus(data.result);
}
