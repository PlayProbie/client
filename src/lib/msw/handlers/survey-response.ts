import { delay, http, HttpResponse } from 'msw';

import type {
  GetSurveyResultDetailsResponse,
  GetSurveyResultsListResponse,
  GetSurveyResultsSummaryResponse,
  SurveyResultListItem,
  SurveySessionStatus,
} from '@/features/survey-response';

import { MSW_API_BASE_URL } from '../constants';
import { toKSTISOString } from '../utils';

// 목업 데이터 생성 헬퍼 - Escape From Duckov 시연용
const generateMockSessionItems = (count: number): SurveyResultListItem[] => {
  const statuses: SurveySessionStatus[] = [
    'COMPLETED',
    'IN_PROGRESS',
    'DROPPED',
  ];
  const questions = [
    '레이드 중 긴장감을 느끼셨나요?',
    '은신처 건설을 통한 성장이 체감되셨나요?',
    '게임을 다시 플레이하고 싶은 마음이 드시나요?',
    '초반 난이도가 적절하다고 느끼셨나요?',
    '탈출 포인트까지의 긴장감은 어땠나요?',
  ];

  return Array.from({ length: count }, (_, i) => ({
    session_id: `session-uuid-${1000 + i}`,
    survey_name: `Escape From Duckov 플레이테스트 #${i + 1}`,
    survey_id: 100 + Math.floor(i / 10),
    tester_id: `tester-uuid-${i}`,
    status: statuses[i % statuses.length],
    first_question: questions[i % questions.length],
    ended_at: toKSTISOString(new Date(Date.now() - i * 3600000)),
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
            survey_name: 'Escape From Duckov 플레이테스트',
            survey_id: surveyId,
            tester_id: 'tester-uuid-123',
            status: 'COMPLETED',
            ended_at: '2025-12-27T16:40:00+09:00',
          },
          by_fixed_question: [
            {
              fixed_q_id: 10,
              fixed_question: '레이드 중 긴장감을 느끼셨나요?',
              excerpt: [
                {
                  q_type: 'FIXED',
                  question_text: '레이드 중 긴장감을 느끼셨나요?',
                  answer_text:
                    '네, 정말 심장이 쿵쾅쿵쾅 뛰었어요! 특히 전리품을 많이 들었을 때요.',
                },
                {
                  q_type: 'TAIL',
                  question_text: '어떤 상황에서 가장 긴장되셨나요?',
                  answer_text:
                    '탈출 포인트 근처에서 적 발소리가 들렸을 때 손에 땀이 났어요.',
                },
              ],
            },
            {
              fixed_q_id: 11,
              fixed_question: '은신처 건설을 통한 성장이 체감되셨나요?',
              excerpt: [
                {
                  q_type: 'FIXED',
                  question_text: '은신처 건설을 통한 성장이 체감되셨나요?',
                  answer_text:
                    '은신처 레벨을 올리니까 좋은 장비를 만들 수 있어서 확실히 성장한 느낌이에요.',
                },
                {
                  q_type: 'TAIL',
                  question_text: '어떤 업그레이드가 가장 도움이 되었나요?',
                  answer_text:
                    '무기 개조대 업그레이드가 가장 유용했어요. 총기 성능이 확 달라졌어요.',
                },
              ],
            },
            {
              fixed_q_id: 12,
              fixed_question: '게임을 다시 플레이하고 싶은 마음이 드시나요?',
              excerpt: [
                {
                  q_type: 'FIXED',
                  question_text: '게임을 다시 플레이하고 싶은 마음이 드시나요?',
                  answer_text:
                    '당연하죠! 다음에는 다른 맵도 도전해보고 싶어요.',
                },
                {
                  q_type: 'TAIL',
                  question_text:
                    '다음 레이드에서 시도해보고 싶은 전략이 있나요?',
                  answer_text:
                    '이번에는 은신 위주로 플레이해서 다음에는 적극적으로 교전해볼 거예요.',
                },
              ],
            },
            {
              fixed_q_id: 13,
              fixed_question: '초반 난이도가 적절하다고 느끼셨나요?',
              excerpt: [
                {
                  q_type: 'FIXED',
                  question_text: '초반 난이도가 적절하다고 느끼셨나요?',
                  answer_text:
                    '처음 몇 판은 좀 어려웠지만 적응하니까 괜찮았어요.',
                },
                {
                  q_type: 'TAIL',
                  question_text: '어떤 부분이 특히 어려우셨나요?',
                  answer_text:
                    '맵 구조를 모르니까 탈출 포인트 찾기가 힘들었어요. 익숙해지니까 훨씬 나아졌어요.',
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
