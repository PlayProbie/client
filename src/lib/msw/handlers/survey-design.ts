import { delay, http, HttpResponse } from 'msw';

import type {
  ApiCreateSurveyRequest,
  CreateSurveyResponse,
} from '@/features/survey-design';

import { MSW_API_BASE_URL } from '../../constants';
import { toKSTISOString } from '../utils';

/**
 * POST /api/surveys - 설문 생성 핸들러
 */
export const surveyDesignHandlers = [
  http.post<never, ApiCreateSurveyRequest>(
    `${MSW_API_BASE_URL}/surveys`,
    async ({ request }) => {
      await delay(300);

      const body = await request.json();
      const surveyUuid = crypto.randomUUID();

      const response: CreateSurveyResponse = {
        result: {
          survey_uuid: surveyUuid,
          survey_name: body.survey_name,
          status: 'DRAFT',
          started_at: body.started_at,
          ended_at: body.ended_at,
          theme_priorities: body.theme_priorities,
          theme_details: body.theme_details,
          created_at: toKSTISOString(new Date()),
        },
      };

      return HttpResponse.json(response, { status: 201 });
    }
  ),
];
