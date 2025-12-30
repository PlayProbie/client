import type {
  GetSurveyResultsSummaryParams,
  GetSurveyResultsSummaryResponse,
} from '../types';

const API_BASE_URL = 'https://playprobie.com/api';

/**
 * GET /surveys/results/{game_id} - 전체 응답 요약
 */
export async function getSurveyResultsSummary(
  params: GetSurveyResultsSummaryParams
): Promise<GetSurveyResultsSummaryResponse> {
  const searchParams = new URLSearchParams();
  if (params.status) {
    searchParams.set('status', params.status);
  }

  const url = `${API_BASE_URL}/surveys/results/${params.gameId}${
    searchParams.toString() ? `?${searchParams.toString()}` : ''
  }`;

  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error('Failed to get survey results summary');
  }

  return response.json();
}
