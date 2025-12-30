import { API_BASE_URL } from '@/constants/api';

import type {
  CreateFixedQuestionsRequest,
  CreateFixedQuestionsResponse,
} from '../types';

/**
 * POST /surveys/fixed_questions - 고정 질문 생성
 */
export async function postFixedQuestions(
  data: CreateFixedQuestionsRequest
): Promise<CreateFixedQuestionsResponse> {
  const response = await fetch(`${API_BASE_URL}/surveys/fixed_questions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error('Failed to create fixed questions');
  }

  return response.json();
}
