import { API_BASE_URL } from '@/constants/api';
import { fetchWithAuth } from '@/services/api-client';

import type {
  GetSurveyResultsListParams,
  GetSurveyResultsListResponse,
} from '../types';

/**
 * GET /surveys/results/{game_uuid}/listup - 전체 응답 리스트
 */
export async function getSurveyResultsList(
  params: GetSurveyResultsListParams
): Promise<GetSurveyResultsListResponse> {
  const searchParams = new URLSearchParams();
  if (params.limit) {
    searchParams.set('limit', params.limit.toString());
  }
  if (params.cursor) {
    searchParams.set('cursor', params.cursor);
  }

  const url = `${API_BASE_URL}/surveys/results/${params.gameUuid}/listup${
    searchParams.toString() ? `?${searchParams.toString()}` : ''
  }`;

  const response = await fetchWithAuth(url, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error('Failed to get survey results list');
  }

  return response.json();
}
