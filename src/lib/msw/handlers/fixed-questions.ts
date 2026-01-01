import { delay, http, HttpResponse } from 'msw';

import type {
  CreateFixedQuestionsRequest,
  CreateFixedQuestionsResponse,
} from '@/features/survey-design';

import { MSW_API_BASE_URL } from '../constants';

/**
 * POST /api/surveys/fixed-questions - 고정 질문 생성 핸들러
 */
export const fixedQuestionsHandlers = [
  http.post<never, CreateFixedQuestionsRequest>(
    `${MSW_API_BASE_URL}/surveys/fixed-questions`,
    async ({ request }) => {
      await delay(200);

      const body = await request.json();

      const response: CreateFixedQuestionsResponse = {
        result: {
          count: body.questions.length,
        },
      };

      return HttpResponse.json(response, { status: 201 });
    }
  ),
];
