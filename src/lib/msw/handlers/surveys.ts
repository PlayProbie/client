import { delay, http, HttpResponse } from 'msw';

import type {
  CreateSurveyRequest,
  CreateSurveyResponse,
} from '@/features/survey-designer';

/**
 * POST /api/surveys - 설문 생성 핸들러
 */
export const surveysHandlers = [
  http.post<never, CreateSurveyRequest>(
    'https://playprobie.com/api/surveys',
    async ({ request }) => {
      await delay(300);

      const body = await request.json();
      const surveyId = Math.floor(Math.random() * 10000) + 1;

      const response: CreateSurveyResponse = {
        result: {
          survey_id: surveyId,
          survey_name: body.survey_name,
          survey_url: `http://localhost:5173/surveys/chat/sessions/84266fdbd31d4c2c6d0665f7e8380fa3`,
          started_at: body.started_at,
          ended_at: body.ended_at,
          test_purpose: body.test_purpose,
          created_at: new Date().toISOString(),
        },
      };

      return HttpResponse.json(response, { status: 201 });
    }
  ),
];
