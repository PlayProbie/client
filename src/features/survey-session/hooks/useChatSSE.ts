/**
 * SSE 연결 관리 훅
 * Server-Sent Events를 통한 AI 질문 수신
 */

import { useCallback, useEffect, useRef, useState } from 'react';

import { API_BASE_URL } from '@/constants/api';

import type {
  ApiSSEQuestionEventData,
  ApiSSETokenEventData,
  UseChatSSEOptions,
  UseChatSSEReturn,
} from '../types';
import { toSSEQuestionEventData, toSSETokenEventData } from '../types';

export function useChatSSE({
  sessionUuid,
  onConnect,
  onQuestion,
  onToken,
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
  const onTokenRef = useRef(onToken);
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
    onTokenRef.current = onToken;
    onStartRef.current = onStart;
    onDoneRef.current = onDone;
    onInterviewCompleteRef.current = onInterviewComplete;
    onErrorRef.current = onError;
    onOpenRef.current = onOpen;
    onDisconnectRef.current = onDisconnect;
  }, [
    onConnect,
    onQuestion,
    onToken,
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
      console.log('[SSE] Connected');
      onConnectRef.current?.();
    });

    // question 이벤트 핸들러
    eventSource.addEventListener('question', (event) => {
      try {
        const apiData: ApiSSEQuestionEventData = JSON.parse(event.data);
        const data = toSSEQuestionEventData(apiData);
        onQuestionRef.current?.(data);
      } catch (e) {
        console.error('[SSE] Failed to parse question event:', e);
      }
    });

    // token 이벤트 핸들러 (꼬리 질문 스트리밍)
    eventSource.addEventListener('token', (event) => {
      try {
        const apiData: ApiSSETokenEventData = JSON.parse(event.data);
        const data = toSSETokenEventData(apiData);
        onTokenRef.current?.(data);
      } catch (e) {
        console.error('[SSE] Failed to parse token event:', e);
      }
    });

    // start 이벤트 핸들러 (AI 처리 시작)
    eventSource.addEventListener('start', () => {
      console.log('[SSE] AI processing started');
      onStartRef.current?.();
    });

    // done 이벤트 핸들러 (AI 응답 완료)
    eventSource.addEventListener('done', (event) => {
      try {
        const data = JSON.parse(event.data);
        console.log('[SSE] AI response done:', data.turn_num);
        onDoneRef.current?.(data.turn_num);
      } catch (e) {
        console.error('[SSE] Failed to parse done event:', e);
      }
    });

    // interview_complete 이벤트 핸들러
    eventSource.addEventListener('interview_complete', () => {
      console.log('[SSE] Interview completed');
      disconnect();
      onInterviewCompleteRef.current?.();
    });

    // error 이벤트 핸들러
    eventSource.addEventListener('error', (event) => {
      console.error('[SSE] Error event:', event);

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
    eventSource.onerror = (error) => {
      console.error('[SSE] Connection error:', error);
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
