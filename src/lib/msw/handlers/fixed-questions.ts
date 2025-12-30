import { delay, http, HttpResponse } from 'msw';

import type {
  CreateFixedQuestionsRequest,
  CreateFixedQuestionsResponse,
} from '@/features/survey-designer';

/**
 * POST /api/surveys/fixed_questions - 고정 질문 생성 핸들러
 */
export const fixedQuestionsHandlers = [
  http.post<never, CreateFixedQuestionsRequest>(
    'https://playprobie.com/api/surveys/fixed_questions',
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
