import { API_BASE_URL } from '@/constants/api';

import type {
  ApiQuestionFeedbackRequest,
  QuestionFeedbackResponse,
} from '../types';

/**
 * POST /surveys/question-feedback - 질문 피드백 요청
 */
export async function postQuestionFeedback(
  data: ApiQuestionFeedbackRequest
): Promise<QuestionFeedbackResponse> {
  const response = await fetch(`${API_BASE_URL}/surveys/question-feedback`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error('Failed to get question feedback');
  }

  return response.json();
}
