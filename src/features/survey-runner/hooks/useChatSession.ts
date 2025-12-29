/**
 * 채팅 세션 관리 훅
 * 세션 복원, SSE 연결, 메시지 전송 통합 관리
 */

import { useCallback, useEffect, useRef, useState } from 'react';

import { restoreChatSession, sendMessage } from '../api';
import { useChatStore } from '../store/useChatStore';
import type { UseChatSessionOptions, UseChatSessionReturn } from '../types';
import { useChatSSE } from './useChatSSE';

export function useChatSession({
  sessionId,
  surveyId,
}: UseChatSessionOptions): UseChatSessionReturn {
  const [isReady, setIsReady] = useState(false);
  const initializedRef = useRef(false);

  const {
    messages,
    currentTurnNum,
    isLoading,
    isComplete,
    error,
    setSession,
    restoreMessages,
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
    },
    onDone: () => {
      console.log('[Chat] Session completed');
      setComplete(true);
    },
    onError: (err) => {
      console.error('[Chat] SSE error:', err);
      setError(err);
    },
    onConnect: () => {
      setConnecting(true);
    },
    onOpen: () => {
      setConnecting(false);
    },
    onDisconnect: () => {
      setConnecting(false);
    },
  });

  // 세션 초기화 - 한 번만 실행
  useEffect(() => {
    // 이미 초기화됐으면 스킵
    if (initializedRef.current) {
      return;
    }
    initializedRef.current = true;

    const initSession = async () => {
      try {
        // surveyId가 있으면 세션 복원 시도
        if (surveyId) {
          const response = await restoreChatSession({
            surveyId,
            sessionId,
          });

          const { session, excerpts, sse_url: sseUrl } = response.result;

          setSession(
            session.session_id,
            session.survey_id,
            session.status,
            sseUrl
          );

          // 기존 대화 복원
          if (excerpts && excerpts.length > 0) {
            restoreMessages(excerpts);
          }

          setIsReady(true);

          // 세션이 진행 중이면 SSE 연결
          if (session.status === 'IN_PROGRESS') {
            connect();
          }
        } else {
          // surveyId 없으면 바로 SSE 연결
          setIsReady(true);
          connect();
        }
      } catch (err) {
        console.error('[Chat] Failed to init session:', err);
        setError('세션 초기화에 실패했습니다.');
      }
    };

    initSession();
  }, [connect, restoreMessages, sessionId, setError, setSession, surveyId]);

  // 답변 전송
  const sendAnswer = useCallback(
    async (answerText: string) => {
      if (!answerText.trim() || isLoading || isComplete) {
        return;
      }

      try {
        // 낙관적 업데이트: UI에 먼저 표시
        addUserMessage(answerText, currentTurnNum);

        // 서버에 전송
        await sendMessage(
          { sessionId },
          { turn_num: currentTurnNum, answer_text: answerText }
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
