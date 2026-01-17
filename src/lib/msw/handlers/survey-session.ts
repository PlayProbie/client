import { delay, http, HttpResponse } from 'msw';

import type {
  ApiSendMessageRequest,
  CreateChatSessionResponse,
  SendMessageResponse,
} from '@/features/survey-session';

import { MSW_API_BASE_URL } from '../../constants';
import { mswSessionStore } from './msw-session-store';

// SSE 질문 목록 (목업) - Escape From Duckov 시연용
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

// 꼬리질문 목업
const mockTailQuestions = [
  '구체적으로 어떤 상황에서 긴장감을 느끼셨나요?',
  '어떤 업그레이드가 가장 유용했나요?',
];

// 인사이트 질문 목업
const mockInsightQuestions = [
  {
    tag_id: 1001,
    insight_type: 'PANIC' as const,
    video_start_ms: 15000,
    video_end_ms: 18000,
    question_text:
      '영상의 15초~18초 구간에서 버튼을 빠르게 여러 번 누르셨는데, 혹시 당황하셨거나 조작이 어려우셨나요?',
    turn_num: 1,
    remaining_insights: 1,
  },
  {
    tag_id: 1002,
    insight_type: 'IDLE' as const,
    video_start_ms: 45000,
    video_end_ms: 52000,
    question_text:
      '45초~52초 구간에서 잠시 멈추셨는데, 어디로 가야 할지 고민되셨나요?',
    turn_num: 2,
    remaining_insights: 0,
  },
];

/**
 * Survey Runner (Chat) MSW Handlers
 */
export const surveySessionHandlers = [
  // POST /api/interview/{survey_uuid} - 새 대화 세션 생성
  http.post(`${MSW_API_BASE_URL}/interview/:surveyUuid`, async ({ params }) => {
    await delay(200);

    const surveyUuid = params.surveyUuid as string;
    const session = mswSessionStore.getOrCreateSession(surveyUuid);

    const response: CreateChatSessionResponse = {
      result: {
        session: {
          session_uuid: session.sessionUuid,
          survey_uuid: surveyUuid,
          status: 'IN_PROGRESS',
        },
        sse_url: `/interview/${session.sessionUuid}/stream`,
      },
    };

    return HttpResponse.json(response, { status: 201 });
  }),

  // GET /api/interview/{sessionUuid}/stream - SSE 스트림
  http.get(
    `${MSW_API_BASE_URL}/interview/:sessionUuid/stream`,
    async ({ params }) => {
      const sessionUuid = params.sessionUuid as string;
      const session = mswSessionStore.getSession(sessionUuid);

      // 세션 상태 가져오기
      const currentTurn = session?.turnNum ?? 0;
      const needsTail = session?.needsTail ?? false;
      const insightIndex = session?.insightIndex ?? 0;

      const stream = new ReadableStream({
        async start(controller) {
          const encoder = new TextEncoder();

          // 1. connect 이벤트
          controller.enqueue(
            encoder.encode(`event: connect\ndata: "connected"\n\n`)
          );
          await delay(300);

          // 2. 꼬리질문
          if (needsTail && currentTurn > 0) {
            controller.enqueue(
              encoder.encode(
                `event: start\ndata: ${JSON.stringify({ status: 'processing' })}\n\n`
              )
            );
            await delay(500);

            const tailQuestion =
              mockTailQuestions[currentTurn % mockTailQuestions.length];
            for (const token of tailQuestion.split(' ')) {
              controller.enqueue(
                encoder.encode(
                  `event: token\ndata: ${JSON.stringify({
                    fixed_q_id: null,
                    q_type: 'TAIL',
                    question_text: token + ' ',
                    turn_num: currentTurn,
                  })}\n\n`
                )
              );
              await delay(50);
            }

            mswSessionStore.updateSession(sessionUuid, { needsTail: false });
            controller.close();
            return;
          }

          // 3. 일반 질문
          const nextQuestion = mockQuestions[currentTurn];
          if (nextQuestion) {
            controller.enqueue(
              encoder.encode(
                `event: question\ndata: ${JSON.stringify(nextQuestion)}\n\n`
              )
            );
            controller.close();
            return;
          }

          // 4. 인사이트 질문
          if (insightIndex < mockInsightQuestions.length) {
            const insightQuestion = mockInsightQuestions[insightIndex];
            controller.enqueue(
              encoder.encode(
                `event: insight_question\ndata: ${JSON.stringify(insightQuestion)}\n\n`
              )
            );
            controller.close();
            return;
          }

          // 5. 완료
          controller.enqueue(
            encoder.encode(
              `event: insight_complete\ndata: ${JSON.stringify({
                total_insights: mockInsightQuestions.length,
                answered: mockInsightQuestions.length,
              })}\n\n`
            )
          );
          await delay(200);
          controller.enqueue(
            encoder.encode(
              `event: interview_complete\ndata: ${JSON.stringify({ status: 'completed' })}\n\n`
            )
          );
          controller.close();
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
  http.post(
    `${MSW_API_BASE_URL}/interview/:sessionUuid/messages`,
    async ({ params, request }) => {
      await delay(200);

      const sessionUuid = params.sessionUuid as string;
      const body = (await request.json()) as ApiSendMessageRequest;
      const session = mswSessionStore.getSession(sessionUuid);

      const currentTurn = session?.turnNum ?? 0;
      const currentQuestion = mockQuestions[currentTurn] || mockQuestions[0];

      // 턴 증가 + 50% 확률 꼬리질문
      mswSessionStore.updateSession(sessionUuid, {
        turnNum: currentTurn + 1,
        needsTail: Math.random() > 0.5,
      });

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

  // POST /api/sessions/{sessionUuid}/replay/insights/{tagId}/answer - 인사이트 답변
  http.post(
    `${MSW_API_BASE_URL}/sessions/:sessionUuid/replay/insights/:tagId/answer`,
    async ({ params }) => {
      await delay(200);

      const sessionUuid = params.sessionUuid as string;
      const tagId = parseInt(params.tagId as string, 10);
      const session = mswSessionStore.getSession(sessionUuid);

      const currentIndex = session?.insightIndex ?? 0;
      mswSessionStore.updateSession(sessionUuid, {
        insightIndex: currentIndex + 1,
      });

      const isComplete = currentIndex + 1 >= mockInsightQuestions.length;

      return HttpResponse.json(
        { result: { tag_id: tagId, is_complete: isComplete } },
        { status: 200 }
      );
    }
  ),
];
