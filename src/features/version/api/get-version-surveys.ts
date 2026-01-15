/**
 * Version Surveys API
 * GET /versions/{versionUuid}/surveys
 */
import { API_BASE_URL } from '@/constants/api';

// ----------------------------------------
// Types
// ----------------------------------------

/** API 응답 설문 항목 */
export interface ApiVersionSurvey {
  survey_uuid: string;
  survey_name: string;
  status: 'DRAFT' | 'ACTIVE' | 'CLOSED';
  created_at: string;
}

/** API 응답 래퍼 */
interface ApiVersionSurveysResponse {
  result: ApiVersionSurvey[];
}

/** 클라이언트 설문 항목 */
export interface VersionSurvey {
  surveyUuid: string;
  surveyName: string;
  status: 'DRAFT' | 'ACTIVE' | 'CLOSED';
  createdAt: string;
}

// ----------------------------------------
// Transform Functions
// ----------------------------------------

function toVersionSurvey(api: ApiVersionSurvey): VersionSurvey {
  return {
    surveyUuid: api.survey_uuid,
    surveyName: api.survey_name,
    status: api.status,
    createdAt: api.created_at,
  };
}

// ----------------------------------------
// API Functions
// ----------------------------------------

/**
 * 버전별 설문 목록 조회
 * GET /versions/{versionUuid}/surveys
 */
export async function getVersionSurveys(versionUuid: string): Promise<VersionSurvey[]> {
  const response = await fetch(`${API_BASE_URL}/versions/${versionUuid}/surveys`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    if (response.status === 404) {
      return [];
    }
    throw new Error('버전별 설문 목록을 불러오는데 실패했습니다.');
  }

  const data: ApiVersionSurveysResponse = await response.json();
  return data.result.map(toVersionSurvey);
}

