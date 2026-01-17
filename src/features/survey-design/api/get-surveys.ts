import { API_BASE_URL } from '@/constants/api';

import type { ApiSurvey } from '../types';

interface GetSurveysResponse {
    result: ApiSurvey[];
}

/**
 * GET /surveys - 설문 목록 조회
 */
export async function getSurveys(): Promise<GetSurveysResponse> {
    const response = await fetch(`${API_BASE_URL}/surveys`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
    });

    if (!response.ok) {
        throw new Error('Failed to fetch surveys');
    }

    return response.json();
}
