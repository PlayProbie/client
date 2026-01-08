/**
 * 세션 가용성 조회 API
 * GET /surveys/{surveyUuid}/session
 */

import { API_BASE_URL } from '../constants';
import type { SessionInfo } from '../types';
import { toSessionInfo } from '../types';

/** 세션 가용성 조회 (테스터 진입 시) */
export async function getSession(surveyUuid: string): Promise<SessionInfo> {
  const response = await fetch(
    `${API_BASE_URL}/surveys/${surveyUuid}/session`,
    { method: 'GET' }
  );

  if (!response.ok) {
    const errorData = await response.json().catch(() => null);
    throw new Error(
      errorData?.message || '세션 정보를 불러오는데 실패했습니다.'
    );
  }

  const data = await response.json();
  return toSessionInfo(data.result);
}
