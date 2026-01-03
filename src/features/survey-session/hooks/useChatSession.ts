/**
 * 채팅 세션 관리 훅
 * 세션 복원, SSE 연결, 메시지 전송 통합 관리
 */

import { useCallback, useEffect, useRef, useState } from 'react';

import { sendMessage } from '../api';
import { CHAT_MESSAGES } from '../constants';
import { useChatStore } from '../store/useChatStore';
import type { UseChatSessionOptions, UseChatSessionReturn } from '../types';
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
      console.log('[Chat] SSE connected');
      setConnecting(true);
    },
    onQuestion: (data) => {
      console.log('[Chat] Received question:', data.turnNum);

      // 첫 번째 질문 전에 인사말 표시
      if (!greetingShownRef.current && data.turnNum === 1) {
        addAIMessage(CHAT_MESSAGES.GREETING, 0, 'FIXED', 0);
        greetingShownRef.current = true;
      }

      addAIMessage(data.questionText, data.turnNum, data.qType, data.fixedQId);
      setIsReady(true);
      setLoading(false);
    },
    onToken: (data) => {
      console.log('[Chat] Received token:', data.questionText);
      appendStreamingToken(data.questionText, data.turnNum);
    },
    onStart: () => {
      console.log('[Chat] AI processing started');
      setStreaming(true);
    },
    onInterviewComplete: () => {
      console.log('[Chat] Interview completed');
      finalizeStreamingMessage();
      // 끝인사 메시지 추가
      addAIMessage(CHAT_MESSAGES.FAREWELL, -1, 'FIXED', -1);
      setComplete(true);
    },
    onError: (err) => {
      console.error('[Chat] SSE error:', err);
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

  // 세션 초기화 - 한 번만 실행
  useEffect(() => {
    console.log('[Chat] Initializing session...', {
      sessionUuid,
      alreadyInitialized: initializedSessions.has(sessionUuid),
    });

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

        // SSE 연결하여 첫 번째 질문 수신
        connect();
        console.log('[Chat] Session initialized-------------------');
      } catch (err) {
        console.error('[Chat] Failed to init session:', err);
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

      try {
        // 현재 턴의 AI 질문 텍스트 찾기
        const currentQuestion = messages.find(
          (m) => m.type === 'ai' && m.turnNum === currentTurnNum
        );
        const questionText = currentQuestion?.content ?? '';
        // fixedQId는 null이 될 수 있으므로 안전하게 처리
        const fixedQId = currentQuestion?.fixedQId ?? currentFixedQId;

        if (fixedQId === null || fixedQId === undefined) {
          console.error('[Chat] fixedQId is missing, cannot send message');
          setError('질문 정보가 누락되었습니다. 페이지를 새로고침해 주세요.');
          return;
        }

        // 낙관적 업데이트: UI에 먼저 표시
        addUserMessage(answerText, currentTurnNum);

        // 서버에 전송
        await sendMessage(
          { sessionUuid },
          {
            fixed_q_id: fixedQId,
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
      sessionUuid,
      currentTurnNum,
      currentFixedQId,
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
    isStreaming,
    error,
    messages,
    currentTurnNum,
    currentFixedQId,
    sendAnswer,
  };
}
