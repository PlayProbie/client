import { delay, http, HttpResponse } from 'msw';

import type {
  QuestionFeedbackItem,
  QuestionFeedbackRequest,
  QuestionFeedbackResponse,
} from '@/features/survey-designer';

/**
 * POST /api/surveys/question-feedback - 질문 피드백 핸들러
 */
export const questionFeedbackHandlers = [
  http.post<never, QuestionFeedbackRequest>(
    'https://playprobie.com/api/surveys/question-feedback',
    async ({ request }) => {
      await delay(1000); // AI 분석 시간 시뮬레이션

      const body = await request.json();

      // 각 질문에 대한 피드백 생성
      const feedbackItems: QuestionFeedbackItem[] = body.questions.map(
        (question) => generateFeedback(question)
      );

      const response: QuestionFeedbackResponse = {
        result: feedbackItems,
      };

      return HttpResponse.json(response, { status: 200 });
    }
  ),
];

/**
 * 질문에 대한 Mock 피드백 생성
 */
function generateFeedback(question: string): QuestionFeedbackItem {
  const summaries = [
    '질문이 명확하고 구체적입니다.',
    '좋은 질문이지만 더 구체적으로 작성하면 좋겠습니다.',
    '응답자가 이해하기 쉬운 질문입니다.',
    '개방형 질문으로 다양한 의견을 수집할 수 있습니다.',
    '측정 가능한 응답을 얻기 좋은 질문입니다.',
  ];

  const suggestionSets = [
    ['더 구체적인 시나리오를 제시해 보세요.', '예시를 추가하면 좋겠습니다.'],
    ['평가 척도를 명시하면 좋겠습니다.', '비교 대상을 제시해 보세요.'],
    ['질문을 두 개로 나누는 것을 고려해 보세요.'],
    ['부정적인 표현을 피하면 좋겠습니다.', '중립적인 어조를 사용해 보세요.'],
    [],
  ];

  const randomIndex = Math.floor(Math.random() * summaries.length);

  return {
    question,
    summary: summaries[randomIndex],
    suggestions: suggestionSets[randomIndex],
  };
}
