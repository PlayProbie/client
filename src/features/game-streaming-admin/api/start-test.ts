/**
 * 관리자 테스트 시작 API
 * POST /surveys/{surveyId}/streaming-resource/start-test
 */
import { API_BASE_URL } from '../constants';
import type { AdminTestResult, ApiAdminTestResponse } from '../types';
import { toAdminTestResult } from '../types';

/** 관리자 테스트 시작 */
export async function startTest(surveyId: number): Promise<AdminTestResult> {
  const response = await fetch(
    `${API_BASE_URL}/surveys/${surveyId}/streaming-resource/start-test`,
    { method: 'POST' }
  );

  if (!response.ok) {
    throw new Error('테스트 시작에 실패했습니다.');
  }

  const data: ApiAdminTestResponse = await response.json();
  return toAdminTestResult(data.result);
}
