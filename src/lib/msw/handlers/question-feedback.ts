import { delay, http, HttpResponse } from 'msw';

import type {
  QuestionFeedbackItem,
  QuestionFeedbackRequest,
  QuestionFeedbackResponse,
} from '@/features/survey-designer';

import { MSW_API_BASE_URL } from '../constants';

/**
 * POST /api/surveys/question-feedback - 질문 피드백 핸들러
 */
export const questionFeedbackHandlers = [
  http.post<never, QuestionFeedbackRequest>(
    `${MSW_API_BASE_URL}/surveys/question-feedback`,
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
 * 질문에 대한 Mock 피드백 생성 - Escape From Duckov 시연용
 */
function generateFeedback(question: string): QuestionFeedbackItem {
  const summaries = [
    '하드코어 생존 게임의 핵심 경험을 측정하는 좋은 질문입니다.',
    'Extraction Shooter 장르의 특성을 잘 반영한 질문입니다.',
    '플레이어의 감정적 경험을 파악하기 좋은 질문입니다.',
    '게임의 성장 시스템 체감도를 측정하는 적절한 질문입니다.',
    '반복 플레이 가치를 평가하는 핵심 질문입니다.',
  ];

  const suggestionSets = [
    [
      '레이드 중 특정 상황(탈출 포인트, 적 조우 등)을 명시하면 좋겠습니다.',
      '긴장감의 강도를 척도로 물어볼 수 있습니다.',
    ],
    [
      '은신처 업그레이드나 장비 커스터마이징 등 구체적인 요소를 언급해 보세요.',
      '성장 전후 비교 질문을 추가하면 좋겠습니다.',
    ],
    ['5개 맵 중 특정 맵에 대한 경험을 물어볼 수 있습니다.'],
    [
      '초반 몇 판 기준을 명시하면 답변이 더 구체적일 수 있습니다.',
      '기본 총기로 시작하는 경험에 대해 물어볼 수 있습니다.',
    ],
    [],
  ];

  const randomIndex = Math.floor(Math.random() * summaries.length);

  return {
    question,
    summary: summaries[randomIndex],
    suggestions: suggestionSets[randomIndex],
  };
}
