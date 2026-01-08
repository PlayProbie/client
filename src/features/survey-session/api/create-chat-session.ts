import { API_BASE_URL } from '@/constants/api';

import type {
  CreateChatSessionParams,
  CreateChatSessionResponse,
} from '../types';

/**
 * POST /interview/{survey_uuid} - 새 대화 세션 생성
 */
export async function createChatSession({
  surveyUuid,
  testerProfile,
}: CreateChatSessionParams): Promise<CreateChatSessionResponse> {
  const response = await fetch(`${API_BASE_URL}/interview/${surveyUuid}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      age_group: testerProfile?.ageGroup,
      gender: testerProfile?.gender,
      prefer_genre: testerProfile?.preferGenre,
    }), // 프로필 정보가 있으면 전송, 없으면 빈 객체 (또는 null)
  });

  if (!response.ok) {
    throw new Error('Failed to create chat session');
  }

  const data = await response.json();
  return data;
}
