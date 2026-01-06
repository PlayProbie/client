/**
 * 설문 목록 API
 * GET /surveys
 */
import { fetchWithAuth } from '@/services/api-client';

import { API_BASE_URL } from '../constants';
import type { ApiSurveysResponse, Survey } from '../types';
import { toSurvey } from '../types';

interface GetSurveysParams {
  gameUuid?: string;
}

/** 설문 목록 조회 */
export async function getSurveys(params?: GetSurveysParams): Promise<Survey[]> {
  const url = new URL(`${API_BASE_URL}/surveys`, window.location.origin);

  if (params?.gameUuid) {
    url.searchParams.set('game_uuid', params.gameUuid);
  }

  const response = await fetchWithAuth(url.toString(), {
    method: 'GET',
  });

  if (!response.ok) {
    throw new Error('설문 목록을 불러오는데 실패했습니다.');
  }

  const data: ApiSurveysResponse = await response.json();
  return data.result.map(toSurvey);
}
