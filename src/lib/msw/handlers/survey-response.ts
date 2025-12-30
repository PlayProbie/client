import { delay, http, HttpResponse } from 'msw';

import type {
  GetSurveyResultDetailsResponse,
  GetSurveyResultsListResponse,
  GetSurveyResultsSummaryResponse,
  SurveyResultListItem,
  SurveySessionStatus,
} from '@/features/survey-response';

import { MSW_API_BASE_URL } from '../constants';

// 목업 데이터 생성 헬퍼
const generateMockSessionItems = (count: number): SurveyResultListItem[] => {
  const statuses: SurveySessionStatus[] = [
    'COMPLETED',
    'IN_PROGRESS',
    'DROPPED',
  ];
  const questions = [
    '튜토리얼이 이해하기 쉬웠나요?',
    '게임의 난이도는 적절했나요?',
    'UI가 직관적이었나요?',
    '스토리가 몰입감 있었나요?',
    '밸런스가 적절하다고 느꼈나요?',
  ];

  return Array.from({ length: count }, (_, i) => ({
    session_id: `session-uuid-${1000 + i}`,
    survey_name: `UX/UI 설문조사 #${i + 1}`,
    survey_id: 100 + Math.floor(i / 10),
    tester_id: `tester-uuid-${i}`,
    status: statuses[i % statuses.length],
    first_question: questions[i % questions.length],
    ended_at: new Date(Date.now() - i * 3600000).toISOString(),
  }));
};

/**
 * Survey Response MSW Handlers
 */
export const surveyResponseHandlers = [
  // GET /api/surveys/results/{game_id} - 전체 응답 요약
  http.get(
    `${MSW_API_BASE_URL}/surveys/results/:gameId`,
    async ({ request }) => {
      await delay(200);

      const url = new URL(request.url);
      const hasListup = url.pathname.includes('/listup');
      const hasDetails = url.pathname.includes('/details');

      // listup이나 details 경로는 다른 핸들러에서 처리
      if (hasListup || hasDetails) {
        return;
      }

      const response: GetSurveyResultsSummaryResponse = {
        result: {
          survey_count: 12,
          response_count: 100,
        },
      };

      return HttpResponse.json(response);
    }
  ),

  // GET /api/surveys/results/{game_id}/listup - 전체 응답 리스트
  http.get(
    `${MSW_API_BASE_URL}/surveys/results/:gameId/listup`,
    async ({ request }) => {
      await delay(300);

      const url = new URL(request.url);
      const limit = parseInt(url.searchParams.get('limit') || '20', 10);
      const cursor = parseInt(url.searchParams.get('cursor') || '0', 10);

      const allItems = generateMockSessionItems(50);
      const startIndex = cursor;
      const content = allItems.slice(startIndex, startIndex + limit);
      const hasNext = startIndex + limit < allItems.length;

      const response: GetSurveyResultsListResponse = {
        result: {
          content,
          nextCursor: hasNext ? startIndex + limit : null,
          hasNext,
        },
      };

      return HttpResponse.json(response);
    }
  ),

  // GET /api/surveys/results/{survey_id}/details/{session_id} - 응답 세부내용
  http.get(
    `${MSW_API_BASE_URL}/surveys/results/:surveyId/details/:sessionId`,
    async ({ params }) => {
      await delay(250);

      const surveyId = parseInt(params.surveyId as string, 10);
      const sessionId = params.sessionId as string;

      const response: GetSurveyResultDetailsResponse = {
        result: {
          session: {
            session_id: sessionId,
            survey_name: 'UX/UI 설문조사',
            survey_id: surveyId,
            tester_id: 'tester-uuid-123',
            status: 'COMPLETED',
            ended_at: '2025-12-27T16:40:00+09:00',
          },
          by_fixed_question: [
            {
              fixed_q_id: 10,
              fixed_question: '튜토리얼이 이해하기 쉬웠나요?',
              excerpt: [
                {
                  q_type: 'FIXED',
                  question_text: '튜토리얼이 이해하기 쉬웠나요?',
                  answer_text: '조작이 어려웠어요.',
                },
                {
                  q_type: 'TAIL',
                  question_text: '어느 지점에서 막혔나요?',
                  answer_text: '설명이 빨리 지나갔어요.',
                },
              ],
            },
            {
              fixed_q_id: 11,
              fixed_question: 'UI가 직관적이었나요?',
              excerpt: [
                {
                  q_type: 'FIXED',
                  question_text: 'UI가 직관적이었나요?',
                  answer_text: '대체로 괜찮았지만 메뉴 찾기가 어려웠어요.',
                },
                {
                  q_type: 'TAIL',
                  question_text: '어떤 메뉴가 찾기 어려웠나요?',
                  answer_text: '설정 메뉴를 찾는 데 시간이 걸렸어요.',
                },
              ],
            },
          ],
        },
      };

      return HttpResponse.json(response);
    }
  ),
];
