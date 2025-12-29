import type {
  RestoreChatSessionParams,
  RestoreChatSessionResponse,
} from '../types';

const API_BASE_URL = 'https://playprobie.com/api';

/**
 * GET /surveys/chat/{survey_id}/{session_id} - 대화 세션 복원
 */
export async function restoreChatSession(
  params: RestoreChatSessionParams
): Promise<RestoreChatSessionResponse> {
  const url = `${API_BASE_URL}/surveys/chat/${params.surveyId}/${params.sessionId}`;

  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error('Failed to restore chat session');
  }

  return response.json();
}
