import { delay, http, HttpResponse } from 'msw';

import type {
  ApiGenerateAiQuestionsRequest,
  GenerateAiQuestionsResponse,
} from '@/features/survey-design';

import { MSW_API_BASE_URL } from '../../constants';

/**
 * POST /api/surveys/ai-questions - AI 질문 생성 핸들러
 */
export const aiQuestionsHandlers = [
  http.post<never, ApiGenerateAiQuestionsRequest>(
    `${MSW_API_BASE_URL}/surveys/ai-questions`,
    async ({ request }) => {
      await delay(1500); // AI 생성 시간 시뮬레이션

      const body = await request.json();
      const count = body.count || 5;

      // 게임 이름과 테마 우선순위에 따른 mock 질문 생성
      const mockQuestions = generateMockQuestions(
        body.game_name,
        body.theme_priorities?.[0] || 'gameplay',
        count
      );

      const response: GenerateAiQuestionsResponse = {
        result: mockQuestions,
      };

      return HttpResponse.json(response, { status: 201 });
    }
  ),
];

/**
 * Mock 질문 생성 함수 - Escape From Duckov 시연용
 * 설문 목적: 긴장감, 성장 체감, 반복 플레이 가치, 난이도 곡선
 */
function generateMockQuestions(
  _gameName: string,
  _testPurpose: string,
  count: number
): string[] {
  // Escape From Duckov 전용 질문 (긴장감, 성장 체감, 반복 플레이 가치, 난이도 곡선)
  const duckovQuestions: string[] = [
    'Escape From Duckov를 플레이하면서 긴장감을 느끼셨나요? 어떤 순간에 가장 긴장되셨나요?',
    '레이드 중 전리품을 모으고 탈출하는 과정에서 "잃으면 안 된다"는 압박감이 게임 경험에 어떤 영향을 주었나요?',
    '탈출 포인트까지 이동할 때의 긴장감은 어땠나요? 발걸음 하나하나가 조심스러웠나요?',
    '은신처 건설과 장비 업그레이드를 통한 성장이 체감되셨나요?',
    '처음 플레이했을 때와 비교해서 현재 실력이 늘었다고 느끼시나요?',
    '기본 총기에서 업그레이드된 장비로 바꿨을 때 게임 플레이가 어떻게 달라졌나요?',
    '게임을 다시 플레이하고 싶은 욕구가 드시나요?',
    '5개의 맵 중 가장 다시 도전해보고 싶은 맵이 있나요?',
    '초반 난이도가 적절하다고 느끼셨나요? 너무 어렵거나 쉬웠던 부분이 있다면 알려주세요.',
    "'평범한 오리'로 시작하는 초기 상태가 적절하다고 느끼셨나요?",
    '맵별 무작위 요소(전리품 위치, 적 배치, 날씨)가 게임을 더 재미있게 만들었나요?',
    '한 판이 끝난 후 바로 다음 판을 시작하고 싶은 마음이 들었나요?',
  ];

  return duckovQuestions.slice(0, count);
}
