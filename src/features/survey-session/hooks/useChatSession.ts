/**
 * 채팅 세션 관리 훅
 * SSE 연결 및 메시지 전송 통합 관리
 */

import { useMutation } from '@tanstack/react-query';
import { useCallback, useEffect, useRef, useState } from 'react';

import { sendMessage } from '../api';
import { useChatStore } from '../store/useChatStore';
import type {
  ApiSendMessageRequest,
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
    isLoading,
    isStreaming,
    isComplete,
    error,
    addUserMessage,
    enqueueReaction,
    enqueueQuestion,
    enqueueStreamToken,
    enqueueFinalize,
    setLoading,
    setConnecting,
    setStreaming,
    setComplete,
    setError,
    setCurrentTurnNum,
    setCurrentFixedQId,
    reset,
  } = useChatStore();

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
    onGenerateTailComplete: (/* data */) => {
      // 꼬리 질문 생성 완료 이벤트
      // 추후 로딩 상태 제어 등에 활용 예정
    },
    onStart: () => {
      setStreaming(true);
    },
    onDone: (_turnNum) => {
      // 말풍선 마무리 -> 큐에 추가
      enqueueFinalize();
      // setStreaming(false)는 큐 처리기가 담당하므로 여기선 생략 가능하나, 
      // 큐 처리 완료 전까지 isStreaming이 true여야 하므로 store의 로직에 맡김
    },
    onInterviewComplete: () => {
      enqueueFinalize();
      setComplete(true);
      setStreaming(false);
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

      // ⭐ 스토어의 최신 currentFixedQId 직접 사용
      const fixedQId = currentFixedQId;
      // OPENING/GREETING 등 fixedQId가 null인 경우는 서버에서 처리

      // 낙관적 업데이트: UI에 먼저 표시
      addUserMessage(answerText, currentTurnNum);

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
      currentTurnNum,
      currentFixedQId,
      messages,
      isLoading,
      isComplete,
      addUserMessage,
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
