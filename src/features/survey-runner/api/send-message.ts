import { API_BASE_URL } from '@/constants/api';

import type {
  SendMessageParams,
  SendMessageRequest,
  SendMessageResponse,
} from '../types';

/**
 * POST /interview/{session_id}/messages - 응답자 대답 전송
 */
export async function sendMessage(
  params: SendMessageParams,
  body: SendMessageRequest
): Promise<SendMessageResponse> {
  const url = `${API_BASE_URL}/interview/${params.sessionId}/messages`;

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
