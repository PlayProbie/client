import type {
  GenerateAiQuestionsRequest,
  GenerateAiQuestionsResponse,
} from '../types';

const API_BASE_URL = 'https://playprobie.com/api';

/**
 * POST /surveys/ai-questions - AI 질문 생성
 */
export async function postAiQuestions(
  data: GenerateAiQuestionsRequest
): Promise<GenerateAiQuestionsResponse> {
  const response = await fetch(`${API_BASE_URL}/surveys/ai-questions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error('Failed to generate AI questions');
  }

  return response.json();
}
