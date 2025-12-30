import { delay, http, HttpResponse } from 'msw';

import type {
  GenerateAiQuestionsRequest,
  GenerateAiQuestionsResponse,
} from '@/features/survey-designer';

/**
 * POST /api/surveys/ai-questions - AI 질문 생성 핸들러
 */
export const aiQuestionsHandlers = [
  http.post<never, GenerateAiQuestionsRequest>(
    'https://playprobie.com/api/surveys/ai-questions',
    async ({ request }) => {
      await delay(1500); // AI 생성 시간 시뮬레이션

      const body = await request.json();
      const count = body.count || 5;

      // 게임 장르와 테스트 목적에 따른 mock 질문 생성
      const mockQuestions = generateMockQuestions(
        body.game_name,
        body.test_purpose,
        count
      );

      const response: GenerateAiQuestionsResponse = {
        result: mockQuestions,
      };

      return HttpResponse.json(response, { status: 200 });
    }
  ),
];

/**
 * Mock 질문 생성 함수
 */
function generateMockQuestions(
  gameName: string,
  testPurpose: string,
  count: number
): string[] {
  const baseQuestions: Record<string, string[]> = {
    'gameplay-validation': [
      `${gameName}의 핵심 게임플레이가 재미있다고 느끼셨나요?`,
      `게임의 난이도가 적절하다고 생각하시나요?`,
      `게임 내 목표가 명확하게 전달되었나요?`,
      `게임을 계속 플레이하고 싶은 욕구가 들었나요?`,
      `게임의 조작감은 어떠셨나요?`,
      `게임 진행 속도가 적절하다고 느끼셨나요?`,
      `특히 재미있었던 부분이 있다면 무엇인가요?`,
    ],
    'ui-ux-feedback': [
      `${gameName}의 UI가 직관적이라고 느끼셨나요?`,
      `메뉴 구조가 이해하기 쉬웠나요?`,
      `필요한 정보를 쉽게 찾을 수 있었나요?`,
      `버튼과 아이콘의 크기가 적절했나요?`,
      `색상과 폰트가 가독성에 문제가 없었나요?`,
      `튜토리얼이 충분히 도움이 되었나요?`,
      `개선이 필요한 UI 요소가 있다면 무엇인가요?`,
    ],
    'balance-testing': [
      `${gameName}에서 특정 캐릭터/아이템이 너무 강하다고 느끼셨나요?`,
      `게임 내 자원 획득량이 적절하다고 생각하시나요?`,
      `스테이지별 난이도 증가가 자연스러웠나요?`,
      `보상 시스템이 공정하다고 느끼셨나요?`,
      `경쟁 콘텐츠에서 밸런스 문제를 경험하셨나요?`,
      `성장 속도가 적절하다고 생각하시나요?`,
    ],
    'story-evaluation': [
      `${gameName}의 스토리가 흥미롭다고 느끼셨나요?`,
      `등장인물들에게 감정적으로 몰입되었나요?`,
      `스토리 전개가 이해하기 쉬웠나요?`,
      `세계관 설정이 독창적이라고 생각하시나요?`,
      `스토리와 게임플레이의 연결이 자연스러웠나요?`,
      `결말에 만족하셨나요?`,
    ],
    'bug-reporting': [
      `${gameName}에서 버그나 오류를 경험하셨나요?`,
      `게임이 갑자기 종료된 적이 있나요?`,
      `그래픽 오류를 발견하셨나요?`,
      `사운드 문제를 경험하셨나요?`,
      `진행 불가능한 상황을 겪으셨나요?`,
      `성능 저하(프레임 드랍 등)를 경험하셨나요?`,
    ],
    'overall-evaluation': [
      `${gameName}을 전반적으로 몇 점 주시겠습니까? (1-10)`,
      `이 게임을 친구에게 추천하시겠습니까?`,
      `게임의 가장 좋았던 점은 무엇인가요?`,
      `가장 개선이 필요한 부분은 무엇인가요?`,
      `출시된다면 구매 의향이 있으시나요?`,
      `유사한 게임과 비교했을 때 어떻게 느끼셨나요?`,
    ],
  };

  const questions =
    baseQuestions[testPurpose] || baseQuestions['overall-evaluation'];
  return questions.slice(0, count);
}
