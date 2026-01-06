/**
 * 관리자 테스트 종료 API
 * POST /surveys/{surveyUuid}/streaming-resource/stop-test
 */
import { fetchWithAuth } from '@/services/api-client';

import { API_BASE_URL } from '../constants';
import type { AdminTestResult, ApiAdminTestResponse } from '../types';
import { toAdminTestResult } from '../types';

/** 관리자 테스트 종료 */
export async function stopTest(surveyUuid: string): Promise<AdminTestResult> {
  const response = await fetchWithAuth(
    `${API_BASE_URL}/surveys/${surveyUuid}/streaming-resource/stop-test`,
    { method: 'POST' }
  );

  if (!response.ok) {
    throw new Error('테스트 종료에 실패했습니다.');
  }

  const data: ApiAdminTestResponse = await response.json();
  return toAdminTestResult(data.result);
}
