import { API_BASE_URL } from '@/constants/api';

import type {
  GetSurveyResultDetailsParams,
  GetSurveyResultDetailsResponse,
} from '../types';

/**
 * GET /surveys/results/{survey_id}/details/{session_id} - 응답 세부내용
 */
export async function getSurveyResultDetails(
  params: GetSurveyResultDetailsParams
): Promise<GetSurveyResultDetailsResponse> {
  const url = `${API_BASE_URL}/surveys/results/${params.surveyId}/details/${params.sessionId}`;

  const response = await fetch(url, {
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
