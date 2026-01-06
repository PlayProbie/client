/**
 * 설문 상태 업데이트 API
 * PATCH /surveys/{surveyUuid}/status
 */
import { fetchWithAuth } from '@/services/api-client';

import { API_BASE_URL } from '../constants';
import type {
  ApiUpdateSurveyStatusResponse,
  SurveyStatusValue,
  UpdateSurveyStatusResponse,
} from '../types';
import { toUpdateSurveyStatusResponse } from '../types';

interface UpdateSurveyStatusParams {
  surveyUuid: string;
  status: SurveyStatusValue;
}

/** 설문 상태 업데이트 (ACTIVE/CLOSED) */
export async function updateSurveyStatus(
  params: UpdateSurveyStatusParams
): Promise<UpdateSurveyStatusResponse> {
  const response = await fetchWithAuth(
    `${API_BASE_URL}/surveys/${params.surveyUuid}/status`,
    {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ status: params.status }),
    }
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || '설문 상태 변경에 실패했습니다.');
  }

  const data: ApiUpdateSurveyStatusResponse = await response.json();
  return toUpdateSurveyStatusResponse(data.result);
}
