import { API_BASE_URL } from '@/constants/api';
import { fetchWithAuth } from '@/services/api-client';

import type {
  GetSurveyResultDetailsParams,
  GetSurveyResultDetailsResponse,
} from '../types';

/**
 * GET /surveys/results/{survey_uuid}/details/{session_uuid} - 응답 세부내용
 */
export async function getSurveyResultDetails(
  params: GetSurveyResultDetailsParams
): Promise<GetSurveyResultDetailsResponse> {
  const url = `${API_BASE_URL}/surveys/results/${params.surveyUuid}/details/${params.sessionUuid}`;

  const response = await fetchWithAuth(url, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error('Failed to get survey result details');
  }

  return response.json();
}
