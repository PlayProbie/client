/**
 * 세션 상태 조회 API (Heartbeat)
 * GET /surveys/{surveyUuid}/session/status?survey_session_uuid={uuid}
 */

import { API_BASE_URL } from '../constants';
import type { ApiSessionStatusResponse, SessionStatus } from '../types';
import { toSessionStatus } from '../types';

/** 세션 상태 조회 (Heartbeat) */
export async function getSessionStatus(
  surveyUuid: string,
  surveySessionUuid?: string
): Promise<SessionStatus> {
  const url = new URL(
    `${API_BASE_URL}/surveys/${surveyUuid}/session/status`,
    window.location.origin
  );

  if (surveySessionUuid) {
    url.searchParams.set('survey_session_uuid', surveySessionUuid);
  }

  const response = await fetch(url.toString(), { method: 'GET' });

  if (!response.ok) {
    const errorData = await response.json().catch(() => null);
    throw new Error(
      errorData?.message || '세션 상태를 확인하는데 실패했습니다.'
    );
  }

  const data: ApiSessionStatusResponse = await response.json();
  return toSessionStatus(data.result);
}
