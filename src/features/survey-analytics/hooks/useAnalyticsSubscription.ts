import { EventSourcePolyfill } from 'event-source-polyfill';
import { useCallback, useEffect, useRef } from 'react';

import { API_BASE_URL } from '@/constants/api';

const MAX_RETRY_COUNT = 3;
const INITIAL_RETRY_DELAY = 1000; // 1초

/**
 * SSE를 통해 분석 업데이트를 구독하는 훅
 * - 중복 연결 방지
 * - 에러/타임아웃 시 자동 재연결 (최대 3회, 지수 백오프)
 */
export function useAnalyticsSubscription(
  surveyUuid: string | null,
  onUpdate: () => void
) {
  const eventSourceRef = useRef<EventSourcePolyfill | null>(null);
  const onUpdateRef = useRef(onUpdate);
  const connectedUuidRef = useRef<string | null>(null);
  const retryCountRef = useRef(0);
  const retryTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const connectRef = useRef<((uuid: string, token: string) => void) | null>(null);

  // onUpdate를 ref로 관리하여 useEffect 재실행 방지
  useEffect(() => {
    onUpdateRef.current = onUpdate;
  }, [onUpdate]);

  const handleUpdate = useCallback(() => {
    onUpdateRef.current();
  }, []);

  const connect = useCallback((uuid: string, token: string) => {
    const url = `${API_BASE_URL}/analytics/${uuid}/subscribe`;

    const eventSource = new EventSourcePolyfill(url, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      heartbeatTimeout: 120000, // 2분 (Heartbeat가 30초마다 오므로 여유있게)
      withCredentials: false, // CORS 이슈 방지
    });

    eventSourceRef.current = eventSource;
    connectedUuidRef.current = uuid;

    eventSource.addEventListener('connect', () => {
      // eslint-disable-next-line no-console
      console.log('✅ SSE Connected');
      retryCountRef.current = 0; // 연결 성공 시 재시도 횟수 초기화
    });

    eventSource.addEventListener('refresh', () => {
      // eslint-disable-next-line no-console
      console.log('🔄 Analytics updated event received');
      handleUpdate();
    });

    eventSource.addEventListener('heartbeat', () => {
      // Heartbeat 수신 (연결 유지용)
    });

    eventSource.onerror = () => {
      // eslint-disable-next-line no-console
      console.warn('⚠️ SSE connection error/timeout');
      eventSource.close();
      eventSourceRef.current = null;

      // 재연결 시도 (최대 MAX_RETRY_COUNT 회)
      if (retryCountRef.current < MAX_RETRY_COUNT) {
        const delay = INITIAL_RETRY_DELAY * Math.pow(2, retryCountRef.current);
        // eslint-disable-next-line no-console
        console.log(`🔄 Reconnecting in ${delay}ms (attempt ${retryCountRef.current + 1}/${MAX_RETRY_COUNT})`);
        
        retryTimeoutRef.current = setTimeout(() => {
          retryCountRef.current++;
          const currentToken = localStorage.getItem('accessToken');
          if (currentToken && connectedUuidRef.current === uuid) {
            connectRef.current?.(uuid, currentToken);
          }
        }, delay);
      } else {
        // eslint-disable-next-line no-console
        console.error('❌ SSE max retries reached, giving up');
        connectedUuidRef.current = null;
      }
    };
  }, [handleUpdate]);

  // connect 함수를 ref에 저장하여 클로저 내에서 안전하게 참조
  useEffect(() => {
    connectRef.current = connect;
  }, [connect]);

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (!surveyUuid || !token) return;

    // 이미 같은 UUID로 연결되어 있으면 스킵
    if (connectedUuidRef.current === surveyUuid && eventSourceRef.current) {
      return;
    }

    // 기존 연결 및 재시도 타이머 정리
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
    }
    if (retryTimeoutRef.current) {
      clearTimeout(retryTimeoutRef.current);
      retryTimeoutRef.current = null;
    }
    retryCountRef.current = 0;

    connect(surveyUuid, token);

    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
        eventSourceRef.current = null;
      }
      if (retryTimeoutRef.current) {
        clearTimeout(retryTimeoutRef.current);
        retryTimeoutRef.current = null;
      }
      connectedUuidRef.current = null;
      retryCountRef.current = 0;
    };
  }, [surveyUuid, connect]);
}
