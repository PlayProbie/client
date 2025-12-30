import { delay, http, HttpResponse } from 'msw';

import type {
  ChatExcerpt,
  CreateChatSessionResponse,
  RestoreChatSessionResponse,
  SendMessageRequest,
  SendMessageResponse,
} from '@/features/survey-runner';

// 목업 대화 발췌 데이터
const generateMockExcerpts = (turnCount: number): ChatExcerpt[] => {
  const questions = [
    { q_type: 'FIXED' as const, text: '튜토리얼이 이해하기 쉬웠나요?' },
    { q_type: 'TAIL' as const, text: '어느 지점에서 막혔나요?' },
    { q_type: 'FIXED' as const, text: 'UI가 직관적이었나요?' },
    { q_type: 'TAIL' as const, text: '어떤 메뉴가 찾기 어려웠나요?' },
  ];

  const answers = [
    '조작이 어려웠어요.',
    '설명이 빨리 지나갔어요.',
    '대체로 괜찮았지만 메뉴 찾기가 어려웠어요.',
    '설정 메뉴를 찾는 데 시간이 걸렸어요.',
  ];

  return Array.from({ length: turnCount }, (_, i) => ({
    turn_num: i + 1,
    q_type: questions[i % questions.length].q_type,
    question_text: questions[i % questions.length].text,
    answer_text: i < turnCount - 1 ? answers[i % answers.length] : null, // 마지막 턴은 답변 대기 중
  }));
};

// SSE 질문 목록 (목업)
const mockQuestions = [
  {
    fixed_q_id: 1,
    q_type: 'FIXED' as const,
    question_text:
      '안녕하세요! 게임 플레이 테스트에 참여해 주셔서 감사합니다. 먼저, 게임의 첫인상이 어땠는지 알려주시겠어요?',
    turn_num: 1,
  },
  {
    fixed_q_id: 2,
    q_type: 'FIXED' as const,
    question_text: '튜토리얼이 게임 방법을 이해하는 데 도움이 되었나요?',
    turn_num: 2,
  },
  {
    fixed_q_id: 3,
    q_type: 'TAIL' as const,
    question_text: '조작 방식에서 불편했던 점이 있다면 구체적으로 알려주세요.',
    turn_num: 3,
  },
  {
    fixed_q_id: 4,
    q_type: 'FIXED' as const,
    question_text: '게임을 다시 플레이하고 싶은 마음이 드시나요?',
    turn_num: 4,
  },
];

// 세션별 턴 추적 (메모리 저장)
const sessionTurns = new Map<string, number>();

/**
 * Survey Runner (Chat) MSW Handlers
 */
export const surveyRunnerHandlers = [
  // POST /api/surveys/interview/{survey_id} - 새 대화 세션 생성
  http.post(
    'https://playprobie.com/api/surveys/interview/:surveyId',
    async ({ params }) => {
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
          sse_url: `/interview/${sessionId}/stream`,
        },
      };

      return HttpResponse.json(response, { status: 201 });
    }
  ),

  // GET /api/surveys/interview/{survey_id}/{session_id} - 대화 세션 복원
  http.get(
    'https://playprobie.com/api/surveys/interview/:surveyId/:sessionId',
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
          sse_url: `/interview/${sessionId}/stream`,
        },
      };

      return HttpResponse.json(response);
    }
  ),

  // POST /api/interview/{session_id}/messages - 응답자 대답 전송
  http.post(
    'https://playprobie.com/api/interview/:sessionId/messages',
    async ({ params, request }) => {
      await delay(200);

      const sessionId = params.sessionId as string;
      const body = (await request.json()) as SendMessageRequest;

      // 턴 증가
      const currentTurn = sessionTurns.get(sessionId) || body.turn_num;
      sessionTurns.set(sessionId, currentTurn + 1);

      const response: SendMessageResponse = {
        result: {
          accepted: true,
          saved_log: {
            turn_num: body.turn_num,
            q_type: 'TAIL',
            fixed_q_id: 10,
            question_text: '어느 지점에서 막혔나요?',
            answer_text: body.answer_text,
            answered_at: new Date().toISOString(),
          },
        },
      };

      // sessionId를 사용하여 로그 출력 (사용되지 않는 변수 경고 방지)
      console.log(`[MSW] Message saved for session ${sessionId}`);

      return HttpResponse.json(response, { status: 201 });
    }
  ),

  // GET /api/interview/{session_id}/stream - SSE 스트림
  http.get(
    'https://playprobie.com/api/interview/:sessionId/stream',
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
];
