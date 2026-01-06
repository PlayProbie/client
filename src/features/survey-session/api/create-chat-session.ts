import { API_BASE_URL } from '@/constants/api';

import type {
  CreateChatSessionParams,
  CreateChatSessionResponse,
} from '../types';

/**
 * POST /interview/{survey_uuid} - 새 대화 세션 생성
 */
export async function createChatSession(
  params: CreateChatSessionParams
): Promise<CreateChatSessionResponse> {
  const url = `${API_BASE_URL}/interview/${params.surveyUuid}`;

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
