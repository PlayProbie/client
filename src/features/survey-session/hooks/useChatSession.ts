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
    addAIMessage,
    appendStreamingToken,
    finalizeStreamingMessage,
    setLoading,
    setConnecting,
    setStreaming,
    setComplete,
    setError,
    reset,
  } = useChatStore();

  const { connect } = useChatSSE({
    sessionUuid,
    onConnect: () => {
      setConnecting(true);
    },
    onQuestion: (data) => {
      // 새 질문 도착 시 이전 스트리밍 메시지 확정 (인사말 등)
      finalizeStreamingMessage();

      // GREETING은 이미 greeting_continue로 스트리밍되었으므로 스킵
      if (data.qType === 'GREETING') {
        setIsReady(true);
        setLoading(false);
        return;
      }

      // Phase 2: Opening
      if (data.qType === 'OPENING') {
        // 이미 표시된 오프닝이면 스킵할 수도 있지만, 서버가 보내주는 대로 믿음
        addAIMessage(data.questionText, data.turnNum, data.qType, data.fixedQId);
      }
      // Phase 5: Closing
      else if (data.qType === 'CLOSING') {
        addAIMessage(data.questionText, data.turnNum, data.qType, data.fixedQId);
        // 클로징은 보통 바로 done으로 이어지거나 인터뷰 완료 처리됨
      }
      // Phase 3-4: Main & Tail
      else {
        addAIMessage(data.questionText, data.turnNum, data.qType, data.fixedQId);
      }

      setIsReady(true);
      setLoading(false);
    },
    onContinue: (data) => {
      // 스트리밍 토큰 수신 (모든 단계 공통)
      appendStreamingToken(data.questionText, data.turnNum, data.qType);
      if (!isStreaming) {
        setStreaming(true);
      }
    },
    onGreetingContinue: (data) => {
      // 인사말 스트리밍 토큰 수신
      appendStreamingToken(data.questionText, data.turnNum, data.qType);
      if (!isStreaming) {
        setStreaming(true);
      }
    },
    onStart: () => {
      setStreaming(true);
    },
    onDone: (_turnNum) => {
      finalizeStreamingMessage();
      setStreaming(false);
      setLoading(false);
    },
    onInterviewComplete: () => {
      finalizeStreamingMessage();
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
      // 스트리밍 중이었다면 메시지 확정
      finalizeStreamingMessage();
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
      // fixedQId는 null이 될 수 있음 (오프닝, 클로징 등)
      // [FIX] 오프닝 질문(첫 턴)의 경우 fixedQId가 null일 수 있는데, 서버 에러 방지를 위해 1로 강제 설정
      const rawFixedQId = currentQuestion?.fixedQId ?? currentFixedQId;
      const fixedQId = rawFixedQId || 1;

      // OPENING 단계 등에서는 fixedQId가 없을 수 있으므로 체크 완화
      // 다만 일반적인 질문에서는 있어야 함. 우선순위: 서버에서 온 fixedQId

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
      setError,
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
