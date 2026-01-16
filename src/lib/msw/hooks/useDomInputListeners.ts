import { useEffect } from 'react';

import {
  MOUSE_MOVE_SAMPLE_INTERVAL,
  MOUSE_MOVE_THRESHOLD,
  WHEEL_SAMPLE_INTERVAL,
} from '@/features/game-streaming-session/hooks/input-logger/constants';
import type { MouseMoveState } from '@/features/game-streaming-session/hooks/input-logger/types';
import type {
  InputLog,
  KeyboardInputLog,
  MouseClickInputLog,
  MouseMoveInputLog,
  WheelInputLog,
} from '@/features/game-streaming-session/types/highlight';

export interface UseInputEventListenersOptions {
  /** 활성화 여부 */
  enabled: boolean;
  /** DOM 리스너 직접 사용 여부 */
  useDomListeners: boolean;
  /** 세그먼트 ID ref */
  currentSegmentIdRef: React.RefObject<string>;
  /** media_time getter */
  getMediaTime: () => number;
  /** 로그 추가 함수 */
  addLog: (log: InputLog) => void;
  /** 마우스 이동 상태 ref */
  lastMouseMoveRef: React.MutableRefObject<MouseMoveState>;
  /** 휠 샘플링 상태 ref */
  lastWheelRef: React.MutableRefObject<number>;
}

/**
 * DOM 직접 이벤트 리스너 훅 (Mock 환경용)
 */
export function useDomInputListeners(
  options: UseInputEventListenersOptions
): void {
  const {
    enabled,
    useDomListeners,
    currentSegmentIdRef,
    getMediaTime,
    addLog,
    lastMouseMoveRef,
    lastWheelRef,
  } = options;

  useEffect(() => {
    if (!enabled || !useDomListeners) return;

    const now = () => Date.now();

    // 키보드 이벤트 핸들러
    const handleKeyDown = (event: KeyboardEvent) => {
      const log: KeyboardInputLog = {
        type: 'KEY_DOWN',
        media_time: getMediaTime(),
        client_ts: now(),
        segment_id: currentSegmentIdRef.current || '',
        code: event.code,
        key: '', // 보안: 민감정보 보호
      };
      addLog(log);
    };

    const handleKeyUp = (event: KeyboardEvent) => {
      const log: KeyboardInputLog = {
        type: 'KEY_UP',
        media_time: getMediaTime(),
        client_ts: now(),
        segment_id: currentSegmentIdRef.current || '',
        code: event.code,
        key: '', // 보안: 민감정보 보호
      };
      addLog(log);
    };

    // 마우스 이벤트 핸들러
    const handleMouseDown = (event: MouseEvent) => {
      const log: MouseClickInputLog = {
        type: 'MOUSE_DOWN',
        media_time: getMediaTime(),
        client_ts: now(),
        segment_id: currentSegmentIdRef.current || '',
        button: event.button,
        x: event.clientX,
        y: event.clientY,
      };
      addLog(log);
    };

    const handleMouseUp = (event: MouseEvent) => {
      const log: MouseClickInputLog = {
        type: 'MOUSE_UP',
        media_time: getMediaTime(),
        client_ts: now(),
        segment_id: currentSegmentIdRef.current || '',
        button: event.button,
        x: event.clientX,
        y: event.clientY,
      };
      addLog(log);
    };

    const handleMouseMove = (event: MouseEvent) => {
      const currentTime = now();
      const last = lastMouseMoveRef.current;
      const timeDiff = currentTime - last.time;
      const distX = Math.abs(event.clientX - last.x);
      const distY = Math.abs(event.clientY - last.y);
      const dist = Math.sqrt(distX * distX + distY * distY);

      if (
        timeDiff >= MOUSE_MOVE_SAMPLE_INTERVAL &&
        dist >= MOUSE_MOVE_THRESHOLD
      ) {
        const log: MouseMoveInputLog = {
          type: 'MOUSE_MOVE',
          media_time: getMediaTime(),
          client_ts: currentTime,
          segment_id: currentSegmentIdRef.current || '',
          x: event.clientX,
          y: event.clientY,
          sampled: true,
        };
        addLog(log);
        lastMouseMoveRef.current = {
          time: currentTime,
          x: event.clientX,
          y: event.clientY,
        };
      }
    };

    const handleWheel = (event: WheelEvent) => {
      const currentTime = now();
      if (currentTime - lastWheelRef.current >= WHEEL_SAMPLE_INTERVAL) {
        const log: WheelInputLog = {
          type: 'WHEEL',
          media_time: getMediaTime(),
          client_ts: currentTime,
          segment_id: currentSegmentIdRef.current || '',
          deltaX: event.deltaX,
          deltaY: event.deltaY,
        };
        addLog(log);
        lastWheelRef.current = currentTime;
      }
    };

    // 이벤트 리스너 등록
    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('keyup', handleKeyUp);
    document.addEventListener('mousedown', handleMouseDown);
    document.addEventListener('mouseup', handleMouseUp);
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('wheel', handleWheel);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('keyup', handleKeyUp);
      document.removeEventListener('mousedown', handleMouseDown);
      document.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('wheel', handleWheel);
    };
  }, [
    enabled,
    useDomListeners,
    addLog,
    getMediaTime,
    currentSegmentIdRef,
    lastMouseMoveRef,
    lastWheelRef,
  ]);
}
