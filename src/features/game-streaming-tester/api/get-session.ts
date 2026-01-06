/**
 * 설문 세션 가용성 조회 API
 * GET /surveys/{surveyUuid}/session
 */
import { API_BASE_URL } from '../constants';
import type {
  ApiSurveySessionAvailabilityResponse,
  SurveySessionAvailability,
} from '../types';
import { toSurveySessionAvailability } from '../types';

export async function getSurveySessionAvailability(
  surveyUuid: string
): Promise<SurveySessionAvailability> {
  const response = await fetch(
    `${API_BASE_URL}/surveys/${surveyUuid}/session`,
    { method: 'GET' }
  );

  if (!response.ok) {
    throw new Error('세션 가용성 정보를 불러오지 못했습니다.');
  }

  const data: ApiSurveySessionAvailabilityResponse = await response.json();
  return toSurveySessionAvailability(data.result);
}
