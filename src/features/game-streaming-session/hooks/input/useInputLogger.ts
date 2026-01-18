/**
 * 입력 로그 수집 훅
 *
 * 키보드/마우스/게임패드/Visibility 이벤트를 수집하고 정규화합니다.
 * - media_time: requestVideoFrameCallback 우선, fallback currentTime
 * - 마우스: 15Hz 샘플링 + 5px 이동 임계값
 * - 휠: 30Hz 샘플링
 * - 게임패드: 버튼/축 변화 감지
 *
 * 이 훅은 여러 서브 훅을 조합하여 단일 API로 제공합니다.
 */
import { useEffect, useRef } from 'react';

import { DEFAULT_BATCH_SIZE } from '../../constants';
import type {
  MouseMoveState,
  UseInputLoggerOptions,
  UseInputLoggerReturn,
} from './input-logger.types';
import { useDomInputListeners } from './useDomInputListeners';
import { useVisibilityListeners } from './useInputEventListeners';
import { useInputFilters } from './useInputFilters';
import { useInputLogStore } from './useInputLogStore';
import { useMediaTime } from './useMediaTime';

export function useInputLogger(
  options: UseInputLoggerOptions
): UseInputLoggerReturn {
  const {
    videoElement,
    sessionId,
    enabled = true,
    onLogBatch,
    batchSize = DEFAULT_BATCH_SIZE,
    useDomListeners = false,
    resolveSegmentIds,
  } = options;

  // enabled를 ref로 추적 (SDK 필터에서 최신 값 참조)
  const enabledRef = useRef(enabled);
  useEffect(() => {
    enabledRef.current = enabled;
  }, [enabled]);

  // 마우스/휠 샘플링 상태 (DOM 리스너용)
  const lastMouseMoveRef = useRef<MouseMoveState>({
    time: 0,
    x: 0,
    y: 0,
  });
  const lastWheelRef = useRef<number>(0);

  // 로그 저장소
  const {
    getLogs,
    logCount,
    addLog,
    clearLogs,
    getLogsBySegment,
    getSegmentIdsWithLogs,
    clearLogsBySegment,
    drainLogsBySegment,
    currentSegmentId,
    currentSegmentIdRef,
  } = useInputLogStore({
    sessionId,
    batchSize,
    onLogBatch,
  });

  // 미디어 시간 추적
  const { getMediaTime } = useMediaTime({
    videoElement,
    enabled,
  });

  // SDK 입력 필터
  const { createKeyboardFilter, createMouseFilter, createGamepadFilter } =
    useInputFilters({
      enabledRef,
      currentSegmentIdRef,
      getMediaTime,
      resolveSegmentIds,
      addLog,
    });

  // Visibility 이벤트 리스너
  useVisibilityListeners(
    enabled,
    currentSegmentIdRef,
    getMediaTime,
    resolveSegmentIds,
    addLog
  );

  // DOM 직접 이벤트 리스너 (Mock 환경용)
  useDomInputListeners({
    enabled,
    useDomListeners,
    currentSegmentIdRef,
    getMediaTime,
    resolveSegmentIds,
    addLog,
    lastMouseMoveRef,
    lastWheelRef,
  });

  return {
    getLogs,
    logCount,
    clearLogs,
    getLogsBySegment,
    getSegmentIdsWithLogs,
    clearLogsBySegment,
    drainLogsBySegment,
    currentSegmentId,
    createKeyboardFilter,
    createMouseFilter,
    createGamepadFilter,
  };
}
