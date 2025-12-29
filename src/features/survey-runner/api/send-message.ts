import type {
  SendMessageParams,
  SendMessageRequest,
  SendMessageResponse,
} from '../types';

const API_BASE_URL = 'https://playprobie.com/api';

/**
 * POST /chat/sessions/{session_id}/messages - 응답자 대답 전송
 */
export async function sendMessage(
  params: SendMessageParams,
  body: SendMessageRequest
): Promise<SendMessageResponse> {
  const url = `${API_BASE_URL}/chat/sessions/${params.sessionId}/messages`;

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    throw new Error('Failed to send message');
  }

  return response.json();
}
