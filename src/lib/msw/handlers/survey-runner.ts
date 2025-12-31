import { delay, http, HttpResponse } from 'msw';

import type {
  ChatExcerpt,
  CreateChatSessionResponse,
  RestoreChatSessionResponse,
  SendMessageRequest,
  SendMessageResponse,
} from '@/features/survey-runner';

import { MSW_API_BASE_URL } from '../constants';

// 목업 대화 발췌 데이터 - Escape From Duckov 시연용
const generateMockExcerpts = (turnCount: number): ChatExcerpt[] => {
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
    fixed_q_id: 1, // 같은 fixed_q_id: 1번 질문에 대한 꼬리질문
    q_type: 'TAIL' as const,
    question_text:
      '긴장감을 느끼셨군요! 혹시 탈출 포인트 근처에서 적과 조우하거나, 전리품을 많이 들고 있을 때 더 조마조마하셨나요?',
    turn_num: 2,
  },
  {
    fixed_q_id: 2,
    q_type: 'FIXED' as const,
    question_text: '은신처 건설과 장비 업그레이드를 통한 성장이 체감되셨나요?',
    turn_num: 3,
  },
  {
    fixed_q_id: 3,
    q_type: 'FIXED' as const,
    question_text:
      '게임을 다시 플레이하고 싶은 욕구가 드시나요? 그 이유는 무엇인가요?',
    turn_num: 4,
  },
];

// 세션별 턴 추적 (메모리 저장)
const sessionTurns = new Map<string, number>();

/**
 * Survey Runner (Chat) MSW Handlers
 *
 * NOTE: Handler order matters! More specific paths (with literal segments like '/stream')
 * must come BEFORE more generic paths (with only params like '/:surveyId/:sessionId')
 * to prevent incorrect route matching.
 */
export const surveyRunnerHandlers = [
  // POST /api/interview/{survey_id} - 새 대화 세션 생성
  http.post(`${MSW_API_BASE_URL}/interview/:surveyId`, async ({ params }) => {
    await delay(200);

    const surveyId = parseInt(params.surveyId as string, 10);
    const sessionId = `session-${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;

    // 새 세션 턴 초기화
    sessionTurns.set(sessionId, 0);

    const response: CreateChatSessionResponse = {
      result: {
        session: {
          session_id: sessionId,
          survey_id: surveyId,
          tester_id: `tester-uuid-${Date.now()}`,
          status: 'IN_PROGRESS',
        },
        sse_url: `/surveys/chat/sessions/${sessionId}`,
      },
    };

    return HttpResponse.json(response, { status: 201 });
  }),

  // GET /api/interview/{session_id}/stream - SSE 스트림
  // NOTE: This handler MUST come before /:surveyId/:sessionId to prevent
  // '/interview/xxx/stream' from matching as surveyId='xxx', sessionId='stream'
  http.get(
    `${MSW_API_BASE_URL}/interview/:sessionId/stream`,
    async ({ params }) => {
      const sessionId = params.sessionId as string;
      console.log(`[MSW] SSE stream started for session ${sessionId}`);

      // 현재 턴 가져오기
      const currentTurn = sessionTurns.get(sessionId) || 0;

      // 다음 질문 결정
      const nextQuestion = mockQuestions[currentTurn];

      // ReadableStream으로 SSE 구현
      const stream = new ReadableStream({
        async start(controller) {
          const encoder = new TextEncoder();

          // 첫 질문 전송 (약간의 지연 후)
          await delay(500);

          if (nextQuestion) {
            const questionEvent = `event: question\ndata: ${JSON.stringify(nextQuestion)}\n\n`;
            controller.enqueue(encoder.encode(questionEvent));
            console.log(`[MSW] Sent question ${nextQuestion.turn_num}`);

            // 브라우저가 메시지를 받을 시간을 주고 스트림 닫기
            await delay(100);
            controller.close();
          } else {
            // 질문이 없으면 먼저 감사 인사 info 이벤트 전송
            const infoEvent = `event: info\ndata: 설문에 참여해 주셔서 감사합니다! 🙏 소중한 의견은 게임 개선에 큰 도움이 됩니다.\n\n`;
            controller.enqueue(encoder.encode(infoEvent));
            console.log(`[MSW] Sent thank you info event`);

            // done 이벤트
            const doneEvent = `event: done\ndata: {}\n\n`;
            controller.enqueue(encoder.encode(doneEvent));
            console.log(`[MSW] Sent done event`);
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

  // POST /api/interview/{session_id}/messages - 응답자 대답 전송
  // 주의: 이 핸들러는 답변 저장만 담당. 다음 질문은 SSE 스트림에서 전송됨
  http.post(
    `${MSW_API_BASE_URL}/interview/:sessionId/messages`,
    async ({ params, request }) => {
      await delay(200);

      const sessionId = params.sessionId as string;
      const body = (await request.json()) as SendMessageRequest;

      // 현재 턴의 질문 정보 가져오기
      const currentTurn = sessionTurns.get(sessionId) || 0;
      const currentQuestion = mockQuestions[currentTurn] || mockQuestions[0];

      // 턴 증가 (다음 SSE 연결 시 다음 질문을 보내기 위해)
      sessionTurns.set(sessionId, currentTurn + 1);

      // 응답: 답변 저장 확인만 반환 (질문은 SSE에서 전송)
      const response: SendMessageResponse = {
        result: {
          accepted: true,
          saved_log: {
            turn_num: body.turn_num,
            q_type: currentQuestion.q_type,
            fixed_q_id: currentQuestion.fixed_q_id,
            question_text: currentQuestion.question_text,
            answer_text: body.answer_text,
            answered_at: new Date().toISOString(),
          },
        },
      };

      console.log(
        `[MSW] Message saved for session ${sessionId}, turn ${currentTurn} -> ${currentTurn + 1}`
      );

      return HttpResponse.json(response, { status: 201 });
    }
  ),

  // GET /api/interview/{survey_id}/{session_id} - 대화 세션 복원
  // NOTE: This handler MUST come after more specific paths like /:sessionId/stream
  http.get(
    `${MSW_API_BASE_URL}/interview/:surveyId/:sessionId`,
    async ({ params }) => {
      await delay(250);

      const surveyId = parseInt(params.surveyId as string, 10);
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
            session_id: sessionId,
            survey_id: surveyId,
            tester_id: 'tester-uuid-restored',
            status: 'IN_PROGRESS',
          },
          excerpts,
          sse_url: `/surveys/chat/sessions/${sessionId}`,
        },
      };

      return HttpResponse.json(response);
    }
  ),
];
