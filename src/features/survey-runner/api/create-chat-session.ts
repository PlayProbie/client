import type {
  CreateChatSessionParams,
  CreateChatSessionResponse,
} from '../types';

const API_BASE_URL = 'https://playprobie.com/api';

/**
 * POST /surveys/chat/{survey_id} - 새 대화 세션 생성
 */
export async function createChatSession(
  params: CreateChatSessionParams
): Promise<CreateChatSessionResponse> {
  const url = `${API_BASE_URL}/surveys/chat/${params.surveyId}`;

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error('Failed to create chat session');
  }

  return response.json();
}
