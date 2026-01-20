/**
 * 채팅 세션 관리 훅
 * SSE 연결 및 메시지 전송 통합 관리
 */

import { useMutation } from '@tanstack/react-query';
import { useCallback, useEffect, useRef, useState } from 'react';

import { postInsightAnswer, sendMessage } from '../api';
import { preloadReplaySources } from '../lib/replay-preloader';
import { useChatStore } from '../store/useChatStore';
import type {
  ApiSendMessageRequest,
  SSEInsightQuestionEventData,
  UseChatSessionOptions,
  UseChatSessionReturn,
} from '../types';
import { useChatSSE } from './useChatSSE';

// Strict Mode에서 remount 시 중복 초기화 방지를 위한 모듈 레벨 Set
const initializedSessions = new Set<string>();

export function useChatSession({
  sessionUuid,
}: UseChatSessionOptions): UseChatSessionReturn {
  const [isReady, setIsReady] = useState(false);
  const initializedRef = useRef(false);
  // 인사말이 표시되었는지 추적
  const greetingShownRef = useRef(false);

  const {
    messages,
    currentTurnNum,
    currentFixedQId,
    currentInsightTagId,
    isLoading,
    isStreaming,
    isComplete,
    error,
    addUserMessage,
    enqueueReaction,
    enqueueQuestion,
    enqueueInsightQuestion,
    enqueueStreamToken,
    enqueueFinalize,
    setLoading,
    setConnecting,
    setStreaming,
    setComplete,
    setError,
    setCurrentTurnNum,
    setCurrentFixedQId,
    setCurrentInsightTagId,
    setReplayPreload,
    reset,
  } = useChatStore();

  const preloadInsightReplay = useCallback(
    async (data: SSEInsightQuestionEventData) => {
      const existing =
        useChatStore.getState().replayPreloads[data.tagId]?.status;

      if (existing === 'loading' || existing === 'ready') {
        return;
      }

      setReplayPreload(data.tagId, { status: 'loading' });

      try {
        const sources = await preloadReplaySources(sessionUuid, {
          tagId: data.tagId,
          insightType: data.insightType,
          videoStartMs: data.videoStartMs,
          videoEndMs: data.videoEndMs,
        });
        setReplayPreload(data.tagId, { status: 'ready', sources });
      } catch (err) {
        const message =
          err instanceof Error
            ? err.message
            : '영상 구간 정보를 불러올 수 없습니다.';
        setReplayPreload(data.tagId, { status: 'error', error: message });
      }
    },
    [sessionUuid, setReplayPreload]
  );

  const { connect } = useChatSSE({
    sessionUuid,
    onConnect: () => {
      setConnecting(true);
    },
    onQuestion: (data) => {
      // 새 질문 도착: 큐에 질문 말풍선 및 텍스트 추가
      // (이전 말풍선은 이미 enqueueFinalize로 닫혔거나 자동 처리됨)

      // GREETING은 이미 greeting_continue로 처리되었으므로 스킵 가능하나,
      // 만약 onQuestion이 먼저 오거나 별도로 오는 경우를 대비해 처리해도 무방.
      // 하지만 기존 로직에서 GREETING은 setIsReady(true)만 하고 리턴했음.
      if (data.qType === 'GREETING') {
        setIsReady(true);
        setLoading(false);
        return;
      }

      // 상태 업데이트 (큐 처리와 무관하게 즉시 반영해도 되는 메타 데이터)
      setCurrentFixedQId(data.fixedQId);
      setCurrentTurnNum(data.turnNum);

      // 큐에 추가: 말풍선 시작 -> 타이핑
      enqueueQuestion(
        data.questionText,
        data.turnNum,
        data.fixedQId,
        data.qType,
        data.order,
        data.totalQuestions
      );

      setIsReady(true);
      setLoading(false);
    },
    onContinue: (data) => {
      // 스트리밍 토큰 -> 큐에 추가
      enqueueStreamToken(
        data.questionText,
        data.turnNum,
        undefined, // q_type은 더 이상 continue 이벤트에 포함되지 않음
        data.fixedQId,
        data.order,
        data.totalQuestions
      );
      if (!isStreaming) {
        setStreaming(true);
      }
    },
    onGreetingContinue: (data) => {
      // 인사말 스트리밍 -> 큐에 추가
      enqueueStreamToken(
        data.questionText,
        data.turnNum,
        undefined, // q_type은 더 이상 continue 이벤트에 포함되지 않음
        data.fixedQId,
        data.order,
        data.totalQuestions
      );
      if (!isStreaming) {
        setStreaming(true);
      }
    },
    onReaction: (data) => {
      // 리액션 -> 큐에 추가 (말풍선 -> 타이핑 -> 대기)
      enqueueReaction(data.reactionText, data.turnNum);
    },
    onGenerateTailComplete: (data) => {
      console.log('꼬리질문 수신(완료):', data);
      enqueueFinalize();
    },
    onStart: () => {
      setStreaming(true);
    },
    onDone: (_turnNum) => {
      // 말풍선 마무리 -> 큐에 추가
      enqueueFinalize();
      // done 이벤트 시점에 로딩 해제 (question 이벤트 없이 스트리밍만 오는 경우 대비)
      setLoading(false);
    },
    onInterviewComplete: () => {
      enqueueFinalize();
      setComplete(true);
      setStreaming(false);

      // 인터뷰 완료 시 로컬 세그먼트 정리
      (async () => {
        try {
          const { createSegmentStore } =
            await import('@/features/game-streaming-session/lib/store/segment-store');
          const store = await createSegmentStore({ sessionId: sessionUuid });
          await store.clear();
        } catch {
          // 세그먼트 정리 실패는 무시
        }
      })();
    },
    onInsightQuestion: (data) => {
      // 인사이트 질문 도착: 큐에 인사이트 말풍선 추가 (재생 버튼 포함)
      setCurrentTurnNum(data.turnNum);
      setCurrentInsightTagId(data.tagId); // 인사이트 답변 시 사용
      enqueueInsightQuestion(
        data.questionText,
        data.turnNum,
        data.tagId,
        data.insightType,
        data.videoStartMs,
        data.videoEndMs
      );
      void preloadInsightReplay(data);
      setIsReady(true);
      setLoading(false);
    },
    onInsightComplete: (/* data */) => {
      // 인사이트 Phase 완료
      // 인터뷰 종료와 별개로, 후속 SSE 이벤트로 인터뷰 종료될 예정
    },
    onRetryRequest: (/* data */) => {
      // RETRY 메시지는 이미 continue 이벤트로 스트리밍되었으므로
      // 여기서는 버블 완료 처리만 수행
      // (done 이벤트에서도 enqueueFinalize가 호출되지만, 안전장치로 여기서도 호출)
      enqueueFinalize();
      setIsReady(true);
      setLoading(false);
    },
    onError: (err) => {
      setError(err);
      setIsReady(false);
    },
    onOpen: () => {
      setConnecting(false);
      setIsReady(true);
    },
    onDisconnect: () => {
      setConnecting(false);
      // 연결 끊기면 마지막 말풍선 닫기
      enqueueFinalize();
    },
  });

  // 메시지 전송 mutation
  const { mutateAsync: sendMessageAsync } = useMutation({
    mutationFn: async (body: ApiSendMessageRequest) => {
      return sendMessage({ sessionUuid }, body);
    },
    onError: () => {
      setError('메시지 전송에 실패했습니다.');
      setLoading(false);
    },
  });

  // 세션 초기화 - 한 번만 실행
  useEffect(() => {
    // 이미 초기화됐으면 스킵 (모듈 레벨에서 체크하여 Strict Mode 대응)
    if (!sessionUuid || initializedSessions.has(sessionUuid)) {
      return;
    }

    // 초기화 시작 전에 Set에 추가하여 중복 방지
    initializedSessions.add(sessionUuid);
    initializedRef.current = true;
    greetingShownRef.current = false;

    const initSession = async () => {
      try {
        // 스토어 리셋 (이전 세션의 메시지 정리)
        reset();

        // SSE 연결하여 첫 번째 질문(또는 오프닝) 수신
        connect();
      } catch {
        setError('세션 초기화에 실패했습니다.');
        // 실패 시 Set에서 제거하여 재시도 가능하게
        initializedSessions.delete(sessionUuid);
      }
    };

    initSession();

    // Cleanup: unmount 시 Set에서 제거 (페이지 재방문 시 다시 초기화 가능)
    return () => {
      initializedSessions.delete(sessionUuid);
    };
  }, [connect, sessionUuid, setError, reset]);

  // 답변 전송
  const sendAnswer = useCallback(
    async (answerText: string) => {
      if (!answerText.trim() || isLoading || isComplete) {
        return;
      }

      // 현재 턴의 AI 질문 텍스트 찾기
      const currentQuestion = messages.find(
        (m) => m.type === 'ai' && m.turnNum === currentTurnNum
      );
      const questionText = currentQuestion?.content ?? '';

      // 낙관적 업데이트: UI에 먼저 표시
      addUserMessage(answerText, currentTurnNum);

      // 인사이트 질문인 경우 별도 API 사용
      if (currentInsightTagId !== null) {
        await postInsightAnswer(
          { sessionUuid, tagId: currentInsightTagId },
          { answerText }
        );
        // 인사이트 답변 완료 후 tagId 초기화
        setCurrentInsightTagId(null);
        return;
      }

      // ⭐ 일반 질문: 스토어의 최신 currentFixedQId 직접 사용
      const fixedQId = currentFixedQId;
      // OPENING/GREETING 등 fixedQId가 null인 경우는 서버에서 처리

      // 서버에 전송 (useMutation 사용)
      await sendMessageAsync({
        fixed_q_id: fixedQId,
        turn_num: currentTurnNum,
        answer_text: answerText,
        question_text: questionText,
      });

      // SSE 연결은 유지됨 - 서버에서 다음 질문을 전송
    },
    [
      sessionUuid,
      currentTurnNum,
      currentFixedQId,
      currentInsightTagId,
      messages,
      isLoading,
      isComplete,
      addUserMessage,
      setCurrentInsightTagId,
      sendMessageAsync,
    ]
  );

  return {
    isReady,
    isComplete,
    isLoading,
    isStreaming,
    error,
    messages,
    currentTurnNum,
    currentFixedQId,
    sendAnswer,
  };
}
