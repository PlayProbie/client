/**
 * SSE 연결 관리 훅
 * Server-Sent Events를 통한 AI 질문 수신
 */

import { useCallback, useEffect, useRef, useState } from 'react';

import { API_BASE_URL } from '@/constants/api';

import type {
  SSEQuestionEventData,
  UseChatSSEOptions,
  UseChatSSEReturn,
} from '../types';

export function useChatSSE({
  sessionId,
  onQuestion,
  onInfo,
  onDone,
  onError,
  onConnect,
  onOpen,
  onDisconnect,
}: UseChatSSEOptions): UseChatSSEReturn {
  const eventSourceRef = useRef<EventSource | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  // Refs for stable callback references
  const onQuestionRef = useRef(onQuestion);
  const onInfoRef = useRef(onInfo);
  const onDoneRef = useRef(onDone);
  const onErrorRef = useRef(onError);
  const onConnectRef = useRef(onConnect);
  const onOpenRef = useRef(onOpen);
  const onDisconnectRef = useRef(onDisconnect);

  // Keep refs up to date
  useEffect(() => {
    onQuestionRef.current = onQuestion;
    onInfoRef.current = onInfo;
    onDoneRef.current = onDone;
    onErrorRef.current = onError;
    onConnectRef.current = onConnect;
    onOpenRef.current = onOpen;
    onDisconnectRef.current = onDisconnect;
  }, [onQuestion, onInfo, onDone, onError, onConnect, onOpen, onDisconnect]);

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

    onConnectRef.current?.();

    const url = `${API_BASE_URL}/interview/${sessionId}/stream`;
    const eventSource = new EventSource(url);
    eventSourceRef.current = eventSource;

    eventSource.onopen = () => {
      setIsConnected(true);
      onOpenRef.current?.();
    };

    // question 이벤트 핸들러
    eventSource.addEventListener('question', (event) => {
      try {
        const data: SSEQuestionEventData = JSON.parse(event.data);
        onQuestionRef.current?.(data);
      } catch (e) {
        console.error('[SSE] Failed to parse question event:', e);
      }
    });

    // info 이벤트 핸들러
    eventSource.addEventListener('info', (event) => {
      console.log('[SSE] Info:', event.data);
      onInfoRef.current?.(event.data);
    });

    // done 이벤트 핸들러
    eventSource.addEventListener('done', () => {
      disconnect();
      onDoneRef.current?.();
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
  }, [sessionId, disconnect]);

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
