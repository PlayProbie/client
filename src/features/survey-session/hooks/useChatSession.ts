/**
 * 채팅 세션 관리 훅
 * 세션 복원, SSE 연결, 메시지 전송 통합 관리
 */

import { useCallback, useEffect, useRef, useState } from 'react';

import { sendMessage } from '../api';
import { useChatStore } from '../store/useChatStore';
import type { UseChatSessionOptions, UseChatSessionReturn } from '../types';
import { useChatSSE } from './useChatSSE';

// Strict Mode에서 remount 시 중복 초기화 방지를 위한 모듈 레벨 Set
const initializedSessions = new Set<string>();

export function useChatSession({
  sessionId,
}: UseChatSessionOptions): UseChatSessionReturn {
  const [isReady, setIsReady] = useState(false);
  const initializedRef = useRef(false);

  const {
    messages,
    currentTurnNum,
    isLoading,
    isComplete,
    error,
    addUserMessage,
    addAIMessage,
    setLoading,
    setConnecting,
    setComplete,
    setError,
  } = useChatStore();

  const { connect } = useChatSSE({
    sessionId,
    onQuestion: (data) => {
      addAIMessage(
        data.question_text,
        data.turn_num,
        data.q_type,
        data.fixed_q_id
      );
    },
    onInfo: (message) => {
      console.log('[Chat] Info:', message);
      // info 메시지를 AI 메시지로 표시 (감사 인사 등)
      addAIMessage(message, -1, 'FIXED', -1);
    },
    onDone: () => {
      console.log('[Chat] Session completed');
      setComplete(true);
    },
    onError: (err) => {
      console.error('[Chat] SSE error:', err);
      setError(err);
      setIsReady(false);
    },
    onConnect: () => {
      setConnecting(true);
    },
    onOpen: () => {
      setConnecting(false);
      setIsReady(true);
    },
    onDisconnect: () => {
      setConnecting(false);
    },
  });

  // 세션 초기화 - 한 번만 실행
  useEffect(() => {
    console.log('[Chat] Initializing session...', {
      sessionId,
      alreadyInitialized: initializedSessions.has(sessionId),
    });

    // 이미 초기화됐으면 스킵 (모듈 레벨에서 체크하여 Strict Mode 대응)
    if (!sessionId || initializedSessions.has(sessionId)) {
      return;
    }

    // 초기화 시작 전에 Set에 추가하여 중복 방지
    initializedSessions.add(sessionId);
    initializedRef.current = true;

    const initSession = async () => {
      try {
        // SSE 연결하여 첫 질문 수신 (isReady는 onOpen에서 설정됨)
        connect();
        console.log('[Chat] Session initialized-------------------');
      } catch (err) {
        console.error('[Chat] Failed to init session:', err);
        setError('세션 초기화에 실패했습니다.');
        // 실패 시 Set에서 제거하여 재시도 가능하게
        initializedSessions.delete(sessionId);
      }
    };

    initSession();

    // Cleanup: unmount 시 Set에서 제거 (페이지 재방문 시 다시 초기화 가능)
    return () => {
      initializedSessions.delete(sessionId);
    };
  }, [connect, sessionId, setError]);

  // 답변 전송
  const sendAnswer = useCallback(
    async (answerText: string) => {
      if (!answerText.trim() || isLoading || isComplete) {
        return;
      }

      try {
        // 현재 턴의 AI 질문 텍스트 찾기
        const currentQuestion = messages.find(
          (m) => m.type === 'ai' && m.turnNum === currentTurnNum
        );
        const questionText = currentQuestion?.content ?? '';

        // 낙관적 업데이트: UI에 먼저 표시
        addUserMessage(answerText, currentTurnNum);

        // 서버에 전송
        await sendMessage(
          { sessionId },
          {
            turn_num: currentTurnNum,
            answer_text: answerText,
            question_text: questionText,
          }
        );

        // 메시지 전송 후 다음 질문을 받기 위해 SSE 재연결
        connect();
      } catch (err) {
        console.error('[Chat] Failed to send message:', err);
        setError('메시지 전송에 실패했습니다.');
        setLoading(false);
      }
    },
    [
      sessionId,
      currentTurnNum,
      messages,
      isLoading,
      isComplete,
      addUserMessage,
      setError,
      setLoading,
      connect,
    ]
  );

  return {
    isReady,
    isComplete,
    isLoading,
    error,
    messages,
    currentTurnNum,
    sendAnswer,
  };
}
