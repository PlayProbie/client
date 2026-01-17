/**
 * SSE 연결 관리 훅
 * Server-Sent Events를 통한 AI 질문 수신
 */

// ----------------------------------------
// SSE Hook
// ----------------------------------------

import { useCallback, useEffect, useRef, useState } from 'react';

import { API_BASE_URL } from '@/constants/api';

import type {
  ApiSSEContinueEventData,
  ApiSSEGenerateTailCompleteEventData,
  ApiSSEQuestionEventData,
  ApiSSEReactionEventData,
  UseChatSSEOptions,
  UseChatSSEReturn,
} from '../types';
import {
  toSSEContinueEventData,
  toSSEGenerateTailCompleteEventData,
  toSSEQuestionEventData,
  toSSEReactionEventData,
} from '../types';

export function useChatSSE({
  sessionUuid,
  onConnect,
  onQuestion,
  onContinue,
  onGreetingContinue,
  onReaction,
  onGenerateTailComplete,
  onStart,
  onDone,
  onInterviewComplete,
  onError,
  onOpen,
  onDisconnect,
}: UseChatSSEOptions): UseChatSSEReturn {
  const eventSourceRef = useRef<EventSource | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  // Refs for stable callback references
  const onConnectRef = useRef(onConnect);
  const onQuestionRef = useRef(onQuestion);
  const onContinueRef = useRef(onContinue);
  const onGreetingContinueRef = useRef(onGreetingContinue);
  const onReactionRef = useRef(onReaction);
  const onGenerateTailCompleteRef = useRef(onGenerateTailComplete);
  const onStartRef = useRef(onStart);
  const onDoneRef = useRef(onDone);
  const onInterviewCompleteRef = useRef(onInterviewComplete);
  const onErrorRef = useRef(onError);
  const onOpenRef = useRef(onOpen);
  const onDisconnectRef = useRef(onDisconnect);

  // Keep refs up to date
  useEffect(() => {
    onConnectRef.current = onConnect;
    onQuestionRef.current = onQuestion;
    onContinueRef.current = onContinue;
    onGreetingContinueRef.current = onGreetingContinue;
    onReactionRef.current = onReaction;
    onGenerateTailCompleteRef.current = onGenerateTailComplete;
    onStartRef.current = onStart;
    onDoneRef.current = onDone;
    onInterviewCompleteRef.current = onInterviewComplete;
    onErrorRef.current = onError;
    onOpenRef.current = onOpen;
    onDisconnectRef.current = onDisconnect;
  }, [
    onConnect,
    onQuestion,
    onContinue,
    onGreetingContinue,
    onReaction,
    onGenerateTailComplete,
    onStart,
    onDone,
    onInterviewComplete,
    onError,
    onOpen,
    onDisconnect,
  ]);

  const disconnect = useCallback(() => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
      setIsConnected(false);
      onDisconnectRef.current?.();
    }
  }, []);

  const connect = useCallback(() => {
    // 이미 연결된 경우 기존 연결 닫기
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
    }

    const url = `${API_BASE_URL}/interview/${sessionUuid}/stream`;
    const eventSource = new EventSource(url);
    eventSourceRef.current = eventSource;

    eventSource.onopen = () => {
      setIsConnected(true);
      onOpenRef.current?.();
    };

    // connect 이벤트 핸들러
    eventSource.addEventListener('connect', () => {
      onConnectRef.current?.();
    });

    // question 이벤트 핸들러
    eventSource.addEventListener('question', (event) => {
      try {
        const apiData: ApiSSEQuestionEventData = JSON.parse(event.data);
        const data = toSSEQuestionEventData(apiData);
        onQuestionRef.current?.(data);
      } catch {
        // JSON 파싱 실패 무시
      }
    });

    // continue 이벤트 핸들러 (스트리밍)
    eventSource.addEventListener('continue', (event) => {
      try {
        const apiData: ApiSSEContinueEventData = JSON.parse(event.data);
        const data = toSSEContinueEventData(apiData);
        onContinueRef.current?.(data);
      } catch {
        // JSON 파싱 실패 무시
      }
    });

    // greeting_continue 이벤트 핸들러 (인사말 스트리밍)
    eventSource.addEventListener('greeting_continue', (event) => {
      try {
        const apiData: ApiSSEContinueEventData = JSON.parse(event.data);
        const data = toSSEContinueEventData(apiData);
        onGreetingContinueRef.current?.(data);
      } catch {
        // JSON 파싱 실패 무시
      }
    });

    // start 이벤트 핸들러 (AI 처리 시작)
    eventSource.addEventListener('start', () => {
      onStartRef.current?.();
    });

    // reaction 이벤트 핸들러 (AI 리액션 메시지)
    eventSource.addEventListener('reaction', (event) => {
      try {
        const apiData: ApiSSEReactionEventData = JSON.parse(event.data);
        const data = toSSEReactionEventData(apiData);
        onReactionRef.current?.(data);
      } catch {
        // JSON 파싱 실패 무시
      }
    });

    // generate_tail_complete 이벤트 핸들러
    eventSource.addEventListener('generate_tail_complete', (event) => {
      try {
        const apiData: ApiSSEGenerateTailCompleteEventData = JSON.parse(
          event.data
        );
        const data = toSSEGenerateTailCompleteEventData(apiData);
        onGenerateTailCompleteRef.current?.(data);
      } catch {
        // JSON 파싱 실패 무시
      }
    });

    // done 이벤트 핸들러 (AI 응답 완료)
    eventSource.addEventListener('done', (event) => {
      try {
        const data = JSON.parse(event.data);
        onDoneRef.current?.(data.turn_num);
      } catch {
        // JSON 파싱 실패 무시
      }
    });

    // interview_complete 이벤트 핸들러
    eventSource.addEventListener('interview_complete', () => {
      disconnect();
      onInterviewCompleteRef.current?.();
    });

    // error 이벤트 핸들러
    eventSource.addEventListener('error', (event) => {
      // MessageEvent인 경우 data 파싱 시도
      if (event instanceof MessageEvent && event.data) {
        try {
          const data = JSON.parse(event.data);
          onErrorRef.current?.(data.message);
        } catch {
          onErrorRef.current?.('SSE 연결 오류');
        }
      }

      disconnect();
    });

    // 일반 onerror (연결 끊김 등)
    eventSource.onerror = () => {
      setIsConnected(false);

      // EventSource.CLOSED 상태이면 재연결 시도하지 않음
      if (eventSource.readyState === EventSource.CLOSED) {
        disconnect();
      }
    };
  }, [sessionUuid, disconnect]);

  // 컴포넌트 언마운트 시 연결 해제
  useEffect(() => {
    return () => {
      disconnect();
    };
  }, [disconnect]);

  return {
    isConnected,
    connect,
    disconnect,
  };
}
