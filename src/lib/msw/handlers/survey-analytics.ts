import { delay, http, HttpResponse } from 'msw';

import type {
  ApiSurveyResultListItem,
  GetSurveyResultDetailsResponse,
  GetSurveyResultsListResponse,
  GetSurveyResultsSummaryResponse,
  SurveySessionStatus,
} from '@/features/survey-analytics';

import { MSW_API_BASE_URL } from '../constants';
import { toKSTISOString } from '../utils';

// 목업 데이터 생성 헬퍼 - Escape From Duckov 시연용
const generateMockSessionItems = (count: number): ApiSurveyResultListItem[] => {
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
    session_uuid: `session-uuid-${1000 + i}`,
    survey_name: `Escape From Duckov 플레이테스트 #${i + 1}`,
    survey_uuid: `survey-uuid-${100 + Math.floor(i / 10)}`,
    surveyId: 100 + Math.floor(i / 10),
    tester_id: `tester-uuid-${i}`,
    status: statuses[i % statuses.length],
    firstQuestion: questions[i % questions.length],
    endedAt: toKSTISOString(new Date(Date.now() - i * 3600000)),
  }));
};

/**
 * Survey Analytics MSW Handlers
 */
export const surveyAnalyticsHandlers = [
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
          surveyCount: 12,
          responseCount: 100,
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
          hasNext: hasNext,
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

      const surveyUuid = params.surveyId as string;
      const sessionUuid = params.sessionId as string;

      const response: GetSurveyResultDetailsResponse = {
        result: {
          session: {
            session_uuid: sessionUuid,
            survey_name: 'Escape From Duckov 플레이테스트',
            survey_uuid: surveyUuid,
            surveyId: 100,
            tester_id: 'tester-uuid-123',
            status: 'COMPLETED',
            endedAt: '2025-12-27T16:40:00+09:00',
          },
          byFixedQuestion: [
            {
              fixedQuestion: '레이드 중 긴장감을 느끼셨나요?',
              excerpt: [
                {
                  qType: 'FIXED',
                  questionText: '레이드 중 긴장감을 느끼셨나요?',
                  answerText:
                    '네, 정말 심장이 쿵쾅쿵쾅 뛰었어요! 특히 전리품을 많이 들었을 때요.',
                },
                {
                  qType: 'TAIL',
                  questionText: '어떤 상황에서 가장 긴장되셨나요?',
                  answerText:
                    '탈출 포인트 근처에서 적 발소리가 들렸을 때 손에 땀이 났어요.',
                },
              ],
            },
            {
              fixedQuestion: '은신처 건설을 통한 성장이 체감되셨나요?',
              excerpt: [
                {
                  qType: 'FIXED',
                  questionText: '은신처 건설을 통한 성장이 체감되셨나요?',
                  answerText:
                    '은신처 레벨을 올리니까 좋은 장비를 만들 수 있어서 확실히 성장한 느낌이에요.',
                },
                {
                  qType: 'TAIL',
                  questionText: '어떤 업그레이드가 가장 도움이 되었나요?',
                  answerText:
                    '무기 개조대 업그레이드가 가장 유용했어요. 총기 성능이 확 달라졌어요.',
                },
              ],
            },
            {
              fixedQuestion: '게임을 다시 플레이하고 싶은 마음이 드시나요?',
              excerpt: [
                {
                  qType: 'FIXED',
                  questionText: '게임을 다시 플레이하고 싶은 마음이 드시나요?',
                  answerText:
                    '당연하죠! 다음에는 다른 맵도 도전해보고 싶어요.',
                },
                {
                  qType: 'TAIL',
                  questionText:
                    '다음 레이드에서 시도해보고 싶은 전략이 있나요?',
                  answerText:
                    '이번에는 은신 위주로 플레이해서 다음에는 적극적으로 교전해볼 거예요.',
                },
              ],
            },
            {
              fixedQuestion: '초반 난이도가 적절하다고 느끼셨나요?',
              excerpt: [
                {
                  qType: 'FIXED',
                  questionText: '초반 난이도가 적절하다고 느끼셨나요?',
                  answerText:
                    '처음 몇 판은 좀 어려웠지만 적응하니까 괜찮았어요.',
                },
                {
                  qType: 'TAIL',
                  questionText: '어떤 부분이 특히 어려우셨나요?',
                  answerText:
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

  // GET /api/analytics/{surveyId} - 질문별 AI 분석 결과 (SSE Mock - JSON 배열로 반환)
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  http.get(`${MSW_API_BASE_URL}/analytics/:surveyId`, async ({ params: _params }) => {
    await delay(800); // 로딩 시뮬레이션

        // 질문 1 분석 결과
        const question1 = {
          fixedQuestionId: 10,
          resultJson: JSON.stringify({
            question_id: 10,
            total_answers: 45,
            clusters: [
              {
                summary: '레이드 긴장감이 매우 높았다는 긍정적 반응',
                percentage: 67,
                count: 30,
                emotion_type: '긴장감',
                geq_scores: {
                  competence: 65,
                  immersion: 78,
                  flow: 72,
                  tension: 85,
                  challenge: 70,
                  positive_affect: 75,
                  negative_affect: 15,
                },
                emotion_detail:
                  '적과의 조우, 탈출 시 긴박함에서 강한 몰입감과 긴장감을 느낌',
                answer_ids: ['ans1', 'ans2', 'ans3'],
                satisfaction: 78,
                keywords: ['심장박동', '탈출', '전리품', '적발견', '긴박함'],
                representative_answer_ids: ['ans1', 'ans2'],
              },
              {
                summary: '긴장감이 적절했지만 더 높이면 좋겠다는 의견',
                percentage: 22,
                count: 10,
                emotion_type: '도전감',
                geq_scores: {
                  competence: 55,
                  immersion: 60,
                  flow: 58,
                  tension: 50,
                  challenge: 65,
                  positive_affect: 60,
                  negative_affect: 25,
                },
                emotion_detail: '긴장감이 있었지만 난이도를 더 높여도 좋겠다는 의견',
                answer_ids: ['ans4', 'ans5'],
                satisfaction: 55,
                keywords: ['적절', '난이도', '더높게', '스릴'],
                representative_answer_ids: ['ans4'],
              },
              {
                summary: '긴장감이 부족하거나 스트레스만 받았다는 부정적 반응',
                percentage: 11,
                count: 5,
                emotion_type: '불쾌감',
                geq_scores: {
                  competence: 30,
                  immersion: 35,
                  flow: 28,
                  tension: 20,
                  challenge: 40,
                  positive_affect: 25,
                  negative_affect: 70,
                },
                emotion_detail: '너무 어려워서 스트레스만 받거나 긴장감이 없었음',
                answer_ids: ['ans6'],
                satisfaction: 28,
                keywords: ['어려움', '스트레스', '짜증', '밸런스'],
                representative_answer_ids: ['ans6'],
              },
            ],
            sentiment: {
              score: 68,
              label: '긍정적',
              distribution: {
                positive: 67,
                neutral: 22,
                negative: 11,
              },
            },
            outliers: {
              count: 3,
              summary:
                '레이드 시스템 자체에 대한 개선 의견 (긴장감과 무관한 의견)',
              answer_ids: ['out1', 'out2', 'out3'],
            },
            meta_summary:
              '대부분의 플레이어가 레이드에서 높은 긴장감과 몰입감을 경험했으며, 특히 탈출 시점에서 가장 큰 긴장감을 느꼈다.',
          }),
        };

        // 질문 2 분석 결과
        const question2 = {
          fixedQuestionId: 11,
          resultJson: JSON.stringify({
            question_id: 11,
            total_answers: 42,
            clusters: [
              {
                summary: '은신처 성장이 명확하게 체감되었다는 긍정적 반응',
                percentage: 71,
                count: 30,
                emotion_type: '성취감',
                geq_scores: {
                  competence: 80,
                  immersion: 70,
                  flow: 68,
                  tension: 45,
                  challenge: 60,
                  positive_affect: 82,
                  negative_affect: 10,
                },
                emotion_detail:
                  '업그레이드를 통해 장비와 능력이 강해지는 것을 실감하며 높은 성취감을 느낌',
                answer_ids: ['ans7', 'ans8', 'ans9'],
                satisfaction: 82,
                keywords: ['업그레이드', '성장', '무기개조', '장비', '강화'],
                representative_answer_ids: ['ans7', 'ans8'],
              },
              {
                summary: '성장은 느껴지지만 속도가 너무 느리다는 의견',
                percentage: 19,
                count: 8,
                emotion_type: '중립',
                geq_scores: {
                  competence: 50,
                  immersion: 48,
                  flow: 45,
                  tension: 35,
                  challenge: 55,
                  positive_affect: 45,
                  negative_affect: 40,
                },
                emotion_detail: '성장 시스템은 좋지만 진행 속도가 느려 답답함을 느낌',
                answer_ids: ['ans10', 'ans11'],
                satisfaction: 48,
                keywords: ['느림', '그라인딩', '시간', '속도'],
                representative_answer_ids: ['ans10'],
              },
              {
                summary: '성장 체감이 부족하다는 부정적 반응',
                percentage: 10,
                count: 4,
                emotion_type: '불쾌감',
                geq_scores: {
                  competence: 25,
                  immersion: 30,
                  flow: 28,
                  tension: 40,
                  challenge: 45,
                  positive_affect: 22,
                  negative_affect: 65,
                },
                emotion_detail: '업그레이드 효과가 미미하거나 체감이 잘 안 됨',
                answer_ids: ['ans12'],
                satisfaction: 25,
                keywords: ['미미함', '효과없음', '별로', '실망'],
                representative_answer_ids: ['ans12'],
              },
            ],
            sentiment: {
              score: 71,
              label: '긍정적',
              distribution: {
                positive: 71,
                neutral: 19,
                negative: 10,
              },
            },
            outliers: {
              count: 2,
              summary: '은신처 UI/UX 개선 의견',
              answer_ids: ['out4', 'out5'],
            },
            meta_summary:
              '대부분의 플레이어가 은신처 업그레이드를 통한 성장을 긍정적으로 평가했으며, 특히 무기 개조 시스템이 높은 만족도를 보였다.',
          }),
        };

        // 질문 3 분석 결과
        const question3 = {
          fixedQuestionId: 12,
          resultJson: JSON.stringify({
            question_id: 12,
            total_answers: 48,
            clusters: [
              {
                summary: '재플레이 의향이 매우 높다는 긍정적 반응',
                percentage: 85,
                count: 41,
                emotion_type: '즐거움',
                geq_scores: {
                  competence: 72,
                  immersion: 80,
                  flow: 78,
                  tension: 70,
                  challenge: 68,
                  positive_affect: 88,
                  negative_affect: 8,
                },
                emotion_detail:
                  '게임이 재미있고 중독성이 있어 계속 플레이하고 싶다는 강한 의지를 보임',
                answer_ids: ['ans13', 'ans14', 'ans15'],
                satisfaction: 88,
                keywords: ['재밌음', '중독성', '다시하고싶음', '한판더', '기대'],
                representative_answer_ids: ['ans13', 'ans14'],
              },
              {
                summary: '재플레이 의향은 있지만 개선점이 필요하다는 의견',
                percentage: 10,
                count: 5,
                emotion_type: '중립',
                geq_scores: {
                  competence: 55,
                  immersion: 52,
                  flow: 50,
                  tension: 48,
                  challenge: 52,
                  positive_affect: 50,
                  negative_affect: 35,
                },
                emotion_detail: '기본은 재미있지만 밸런스나 콘텐츠가 개선되면 더 좋겠다는 의견',
                answer_ids: ['ans16'],
                satisfaction: 52,
                keywords: ['개선필요', '밸런스', '콘텐츠', '추가'],
                representative_answer_ids: ['ans16'],
              },
            ],
            sentiment: {
              score: 85,
              label: '매우 긍정적',
              distribution: {
                positive: 85,
                neutral: 10,
                negative: 5,
              },
            },
            outliers: {
              count: 2,
              summary: '게임 장르 자체가 맞지 않는다는 의견',
              answer_ids: ['out6', 'out7'],
            },
            meta_summary:
              '압도적으로 높은 재플레이 의향을 보이며, 게임의 재미와 중독성이 핵심 강점으로 나타났다.',
          }),
        };

        // Mock: 개발 환경에서는 배열로 반환 (SSE 대신)
        const questions = [question1, question2, question3];

    return HttpResponse.json(questions);
  }),
];
