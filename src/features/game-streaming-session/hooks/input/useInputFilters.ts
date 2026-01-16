/**
 * SDK 입력 필터 팩토리
 *
 * StreamClient의 inputFilters용 필터 함수를 생성합니다.
 */
import { useCallback, useMemo, useRef } from 'react';

import type { GamepadState, MouseMoveState } from '../../lib/input/input-filters';
import {
  buildGamepadFilter,
  buildKeyboardFilter,
  buildMouseFilter,
} from '../../lib/input/input-filters';
import { createSegmentInfoResolver } from '../../lib/recorder/segment-resolver';
import type { InputLog } from '../../types';

export interface CreateInputFiltersOptions {
  /** enabled 상태 ref */
  enabledRef: React.RefObject<boolean>;
  /** 세그먼트 ID ref */
  currentSegmentIdRef: React.RefObject<string>;
  /** media_time getter */
  getMediaTime: () => number;
  /** 오버랩 포함 세그먼트 resolver */
  resolveSegmentIds?: (mediaTimeMs: number) => string[];
  /** 로그 추가 함수 */
  addLog: (log: InputLog) => void;
}

export interface CreateInputFiltersReturn {
  createKeyboardFilter: () => (event: KeyboardEvent) => boolean;
  createMouseFilter: () => (event: MouseEvent) => boolean;
  createGamepadFilter: () => (gamepad: Gamepad) => boolean;
}

export function useInputFilters(
  options: CreateInputFiltersOptions
): CreateInputFiltersReturn {
  const {
    enabledRef,
    currentSegmentIdRef,
    getMediaTime,
    resolveSegmentIds,
    addLog,
  } = options;

  // 마우스 샘플링 상태
  const lastMouseMoveRef = useRef<MouseMoveState>({
    time: 0,
    x: 0,
    y: 0,
  });

  // 휠 샘플링 상태
  const lastWheelRef = useRef<number>(0);

  // 게임패드 상태 캐시
  const lastGamepadStateRef = useRef<Map<number, GamepadState>>(new Map());

  const resolveSegmentInfo = useMemo(
    () => createSegmentInfoResolver(currentSegmentIdRef, resolveSegmentIds),
    [currentSegmentIdRef, resolveSegmentIds]
  );

  const createKeyboardFilter = useCallback(() => {
    return buildKeyboardFilter({
      enabledRef,
      getMediaTime,
      resolveSegmentInfo,
      addLog,
    });
  }, [enabledRef, getMediaTime, resolveSegmentInfo, addLog]);

  const createMouseFilter = useCallback(() => {
    return buildMouseFilter({
      enabledRef,
      getMediaTime,
      resolveSegmentInfo,
      addLog,
      lastMouseMoveRef,
      lastWheelRef,
    });
  }, [enabledRef, getMediaTime, resolveSegmentInfo, addLog]);

  const createGamepadFilter = useCallback(() => {
    return buildGamepadFilter({
      enabledRef,
      getMediaTime,
      resolveSegmentInfo,
      addLog,
      lastGamepadStateRef,
    });
  }, [enabledRef, getMediaTime, resolveSegmentInfo, addLog]);

  return {
    createKeyboardFilter,
    createMouseFilter,
    createGamepadFilter,
  };
}
