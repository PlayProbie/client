import { API_BASE_URL } from '@/constants/api';

import type { ApiCreateSurveyRequest, CreateSurveyResponse } from '../types';

/**
 * POST /surveys - 설문 생성
 */
export async function postSurvey(
  data: ApiCreateSurveyRequest
): Promise<CreateSurveyResponse> {
  const response = await fetch(`${API_BASE_URL}/surveys`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ ...data, test_purpose: 'UX/UI 개편' }),
  });

  if (!response.ok) {
    throw new Error('Failed to create survey');
  }

  return response.json();
}
