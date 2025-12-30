import type { CreateSurveyRequest, CreateSurveyResponse } from '../types';

const API_BASE_URL = 'https://playprobie.com/api';

/**
 * POST /surveys - 설문 생성
 */
export async function postSurvey(
  data: CreateSurveyRequest
): Promise<CreateSurveyResponse> {
  const response = await fetch(`${API_BASE_URL}/surveys`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error('Failed to create survey');
  }

  return response.json();
}
