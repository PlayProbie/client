import { delay, http, HttpResponse } from 'msw';

import type {
  ApiChatExcerpt,
  ApiSendMessageRequest,
  CreateChatSessionResponse,
  RestoreChatSessionResponse,
  SendMessageResponse,
} from '@/features/survey-session';

import { MSW_API_BASE_URL } from '../constants';

// 목업 대화 발췌 데이터 - Escape From Duckov 시연용
const generateMockExcerpts = (turnCount: number): ApiChatExcerpt[] => {
  const questions = [
    {
      q_type: 'FIXED' as const,
      text: '레이드 중 긴장감을 느끼셨나요?',
    },
    {
      q_type: 'TAIL' as const,
      text: '어떤 상황에서 가장 긴장되셨나요?',
    },
    {
      q_type: 'FIXED' as const,
      text: '은신처 건설을 통한 성장이 체감되셨나요?',
    },
    {
      q_type: 'TAIL' as const,
      text: '어떤 업그레이드가 가장 도움이 되었나요?',
    },
  ];

  const answers = [
    '탈출 포인트까지 갈 때 정말 심장이 뛰었어요.',
    '전리품을 많이 들고 있는데 적 발소리가 들렸을 때요.',
    '은신처 레벨 올리니까 확실히 장비가 좋아졌어요.',
    '무기 개조대 업그레이드가 제일 유용했어요.',
  ];

  return Array.from({ length: turnCount }, (_, i) => ({
    turn_num: i + 1,
    q_type: questions[i % questions.length].q_type,
    question_text: questions[i % questions.length].text,
    answer_text: i < turnCount - 1 ? answers[i % answers.length] : null, // 마지막 턴은 답변 대기 중
  }));
};

// SSE 질문 목록 (목업) - Escape From Duckov 시연용
// FIXED 질문은 AI 질문 생성 목록(ai-questions.ts)과 일치해야 함
// TAIL 질문은 직전 FIXED 질문에 대한 논리적 꼬리질문
const mockQuestions = [
  {
    fixed_q_id: 1,
    q_type: 'FIXED' as const,
    question_text:
      '안녕하세요! Escape From Duckov 플레이 테스트에 참여해 주셔서 감사합니다. \n\n🦆 먼저, Escape From Duckov를 플레이하면서 긴장감을 느끼셨나요? 어떤 순간에 가장 긴장되셨나요?',
    turn_num: 1,
  },
  {
    fixed_q_id: 2,
    q_type: 'FIXED' as const,
    question_text: '은신처 건설과 장비 업그레이드를 통한 성장이 체감되셨나요?',
    turn_num: 2,
  },
  {
    fixed_q_id: 3,
    q_type: 'FIXED' as const,
    question_text: '게임을 다시 플레이하고 싶은 욕구가 드시나요?',
    turn_num: 3,
  },
];

// 꼬리질문 목업 (토큰 스트리밍용)
const mockTailQuestions = [
  '구체적으로 어떤 상황에서 긴장감을 느끼셨나요?',
  '어떤 업그레이드가 가장 유용했나요?',
];

// 세션별 턴 추적 (메모리 저장)
const sessionTurns = new Map<string, number>();
// 세션별 현재 fixed_q_id 추적
const sessionFixedQIds = new Map<string, number>();
// 세션별 꼬리질문 생성 여부 추적
const sessionNeedsTail = new Map<string, boolean>();

/**
 * Survey Runner (Chat) MSW Handlers
 *
 * NOTE: Handler order matters! More specific paths (with literal segments like '/stream')
 * must come BEFORE more generic paths (with only params like '/:surveyId/:sessionId')
 * to prevent incorrect route matching.
 */
export const surveySessionHandlers = [
  // POST /api/interview/{survey_id} - 새 대화 세션 생성
  http.post(`${MSW_API_BASE_URL}/interview/:surveyId`, async () => {
    await delay(200);

    const sessionUuid = `session-${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;

    // 새 세션 턴 초기화
    sessionTurns.set(sessionUuid, 0);
    sessionFixedQIds.set(sessionUuid, 1);
    sessionNeedsTail.set(sessionUuid, false);

    const response: CreateChatSessionResponse = {
      result: {
        session: {
          session_id: 1, // FIXME: 실제 session_id
          session_uuid: sessionUuid,
          survey_id: 1, // MSW mock: 실제로는 surveyUuid로 조회된 survey_id
          status: 'IN_PROGRESS',
        },
        sse_url: `/interview/${sessionUuid}/stream`,
      },
    };

    return HttpResponse.json(response, { status: 201 });
  }),

  // GET /api/interview/{sessionUuid}/stream - SSE 스트림
  // NOTE: This handler MUST come before /:surveyId/:sessionId to prevent
  // '/interview/xxx/stream' from matching as surveyId='xxx', sessionId='stream'
  http.get(
    `${MSW_API_BASE_URL}/interview/:sessionUuid/stream`,
    async ({ params }) => {
      const sessionUuid = params.sessionUuid as string;

      // 현재 턴 가져오기
      const currentTurn = sessionTurns.get(sessionUuid) || 0;
      const needsTail = sessionNeedsTail.get(sessionUuid) || false;

      // ReadableStream으로 SSE 구현
      const stream = new ReadableStream({
        async start(controller) {
          const encoder = new TextEncoder();

          // 1. connect 이벤트 즉시 전송
          const connectEvent = `event: connect\ndata: "connected"\n\n`;
          controller.enqueue(encoder.encode(connectEvent));

          await delay(300);

          // 2. 꼬리질문이 필요한 경우 (답변 후 SSE 재연결)
          if (needsTail && currentTurn > 0) {
            // start 이벤트 전송
            const startEvent = `event: start\ndata: ${JSON.stringify({ status: 'processing' })}\n\n`;
            controller.enqueue(encoder.encode(startEvent));

            await delay(500);

            // token 이벤트로 꼬리질문 스트리밍 (간단한 시뮬레이션)
            const tailQuestion =
              mockTailQuestions[currentTurn % mockTailQuestions.length];
            const tokens = tailQuestion.split(' ');

            for (const token of tokens) {
              const tokenEvent = `event: token\ndata: ${JSON.stringify({
                fixed_q_id: null,
                q_type: 'TAIL',
                question_text: token + ' ',
                turn_num: currentTurn,
              })}\n\n`;
              controller.enqueue(encoder.encode(tokenEvent));
              await delay(50);
            }

            // 꼬리질문 사용 완료
            sessionNeedsTail.set(sessionUuid, false);

            await delay(100);
            controller.close();
            return;
          }

          // 3. 다음 질문 결정
          const nextQuestion = mockQuestions[currentTurn];

          if (nextQuestion) {
            const questionEvent = `event: question\ndata: ${JSON.stringify(nextQuestion)}\n\n`;
            controller.enqueue(encoder.encode(questionEvent));

            await delay(100);
            controller.close();
          } else {
            // 질문이 없으면 interview_complete 이벤트 전송
            const completeEvent = `event: interview_complete\ndata: ${JSON.stringify({ status: 'completed' })}\n\n`;
            controller.enqueue(encoder.encode(completeEvent));

            controller.close();
          }
        },
      });

      return new HttpResponse(stream, {
        status: 200,
        headers: {
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache',
          Connection: 'keep-alive',
        },
      });
    }
  ),

  // POST /api/interview/{sessionUuid}/messages - 응답자 대답 전송
  // 주의: 이 핸들러는 답변 저장만 담당. 다음 질문은 SSE 스트림에서 전송됨
  http.post(
    `${MSW_API_BASE_URL}/interview/:sessionUuid/messages`,
    async ({ params, request }) => {
      await delay(200);

      const sessionUuid = params.sessionUuid as string;
      const body = (await request.json()) as ApiSendMessageRequest;

      // 현재 턴의 질문 정보 가져오기
      const currentTurn = sessionTurns.get(sessionUuid) || 0;
      const currentQuestion = mockQuestions[currentTurn] || mockQuestions[0];

      // 턴 증가 (다음 SSE 연결 시 다음 질문을 보내기 위해)
      sessionTurns.set(sessionUuid, currentTurn + 1);

      // 50% 확률로 꼬리질문 생성 플래그 설정
      if (Math.random() > 0.5) {
        sessionNeedsTail.set(sessionUuid, true);
      }

      // 응답: 새 명세에 맞는 구조
      const response: SendMessageResponse = {
        result: {
          turn_num: body.turn_num,
          q_type: currentQuestion.q_type,
          fixed_q_id: body.fixed_q_id,
          question_text: body.question_text,
          answer_text: body.answer_text,
        },
      };

      return HttpResponse.json(response, { status: 201 });
    }
  ),

  // GET /api/interview/{survey_id}/{session_id} - 대화 세션 복원
  // NOTE: This handler MUST come after more specific paths like /:sessionUuid/stream
  http.get(
    `${MSW_API_BASE_URL}/interview/:surveyId/:sessionId`,
    async ({ params }) => {
      await delay(250);

      const sessionId = params.sessionId as string;

      // 새 세션이면 턴 초기화 (기존 대화 없음)
      if (!sessionTurns.has(sessionId)) {
        sessionTurns.set(sessionId, 0);
      }

      const currentTurn = sessionTurns.get(sessionId) || 0;
      // 기존 대화가 있는 경우에만 excerpts 반환
      const excerpts = currentTurn > 0 ? generateMockExcerpts(currentTurn) : [];

      const response: RestoreChatSessionResponse = {
        result: {
          session: {
            session_id: 1, // FIXME: 실제 session_id
            session_uuid: sessionId,
            survey_id: 1, // MSW mock: 실제로는 surveyUuid로 조회된 survey_id
            status: 'IN_PROGRESS',
          },
          excerpts,
          sse_url: `/interview/${sessionId}/stream`,
        },
      };

      return HttpResponse.json(response);
    }
  ),
];
