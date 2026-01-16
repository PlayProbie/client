import { useEffect } from 'react';

import type { InputLog } from '../../types/highlight';
import { createDomInputHandlers } from './dom-input-handlers';
import { createSegmentInfoResolver } from './segment-resolver';
import type { MouseMoveState } from './types';

export interface UseInputEventListenersOptions {
  /** 활성화 여부 */
  enabled: boolean;
  /** DOM 리스너 직접 사용 여부 */
  useDomListeners: boolean;
  /** 세그먼트 ID ref */
  currentSegmentIdRef: React.RefObject<string>;
  /** media_time getter */
  getMediaTime: () => number;
  /** 오버랩 포함 세그먼트 resolver */
  resolveSegmentIds?: (mediaTimeMs: number) => string[];
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
    resolveSegmentIds,
    addLog,
    lastMouseMoveRef,
    lastWheelRef,
  } = options;

  useEffect(() => {
    if (!enabled || !useDomListeners) return;

    const resolveSegmentInfo = createSegmentInfoResolver(
      currentSegmentIdRef,
      resolveSegmentIds
    );

    const {
      handleKeyDown,
      handleKeyUp,
      handleMouseDown,
      handleMouseUp,
      handleMouseMove,
      handleWheel,
    } = createDomInputHandlers({
      getMediaTime,
      resolveSegmentInfo,
      addLog,
      lastMouseMoveRef,
      lastWheelRef,
    });

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
    resolveSegmentIds,
  ]);
}
