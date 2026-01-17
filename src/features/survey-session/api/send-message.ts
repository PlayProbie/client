import { API_BASE_URL } from '@/constants/api';

import type {
  ApiSendMessageRequest,
  SendMessageParams,
  SendMessageResponse,
} from '../types';

/**
 * POST /interview/{sessionUuid}/messages - 응답자 대답 전송
 */
export async function sendMessage(
  params: SendMessageParams,
  body: ApiSendMessageRequest
): Promise<SendMessageResponse> {
  const url = `${API_BASE_URL}/interview/${params.sessionUuid}/messages`;

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
