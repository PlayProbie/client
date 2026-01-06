import { API_BASE_URL } from '@/constants/api';
import { fetchWithAuth } from '@/services/api-client';

import type {
  ApiCreateFixedQuestionsRequest,
  CreateFixedQuestionsResponse,
} from '../types';

/**
 * POST /surveys/fixed-questions - 고정 질문 생성
 */
export async function postFixedQuestions(
  data: ApiCreateFixedQuestionsRequest
): Promise<CreateFixedQuestionsResponse> {
  const response = await fetchWithAuth(
    `${API_BASE_URL}/surveys/fixed-questions`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    }
  );

  if (!response.ok) {
    throw new Error('Failed to create fixed questions');
  }

  return response.json();
}
