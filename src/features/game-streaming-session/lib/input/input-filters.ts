/**
 * 입력 필터 - 키보드, 마우스, 게임패드
 *
 * 이 파일은 hooks/input-logger/filters/*.ts 파일들을 병합한 것입니다.
 */

import type { RefObject } from 'react';

import {
  GAMEPAD_AXIS_THRESHOLD,
  MOUSE_MOVE_SAMPLE_INTERVAL,
  MOUSE_MOVE_THRESHOLD,
  WHEEL_SAMPLE_INTERVAL,
} from '../../constants';
import type {
  GamepadAxisInputLog,
  GamepadButtonInputLog,
  InputLog,
  KeyboardInputLog,
  MouseClickInputLog,
  MouseMoveInputLog,
  WheelInputLog,
} from '../../types';
import type { SegmentInfoResolver } from '../recorder/segment-resolver';

// ----------------------------------------
// Types
// ----------------------------------------

export interface GamepadState {
  buttons: boolean[];
  axes: number[];
}

export interface MouseMoveState {
  time: number;
  x: number;
  y: number;
}

export interface FilterDependencies {
  enabledRef: RefObject<boolean>;
  getMediaTime: () => number;
  resolveSegmentInfo: SegmentInfoResolver;
  addLog: (log: InputLog) => void;
}

export interface MouseFilterDependencies extends FilterDependencies {
  lastMouseMoveRef: RefObject<MouseMoveState>;
  lastWheelRef: RefObject<number>;
}

export interface GamepadFilterDependencies extends FilterDependencies {
  lastGamepadStateRef: RefObject<Map<number, GamepadState>>;
}

// ----------------------------------------
// Keyboard Filter
// ----------------------------------------

export function buildKeyboardFilter(
  deps: FilterDependencies
): (event: KeyboardEvent) => boolean {
  const { enabledRef, getMediaTime, resolveSegmentInfo, addLog } = deps;

  return (event: KeyboardEvent): boolean => {
    if (!enabledRef.current) return true;

    const mediaTime = getMediaTime();
    const { primaryId, segmentIds } = resolveSegmentInfo(mediaTime);

    const log: KeyboardInputLog = {
      type: event.type === 'keydown' ? 'KEY_DOWN' : 'KEY_UP',
      media_time: mediaTime,
      timestamp: Date.now(),
      segment_id: primaryId,
      segment_ids: segmentIds,
      code: event.code,
      key: '', // 보안: event.key 대신 빈 문자열 (민감정보 보호)
    };
    addLog(log);

    return true;
  };
}

// ----------------------------------------
// Mouse Filter
// ----------------------------------------

export function buildMouseFilter(
  deps: MouseFilterDependencies
): (event: MouseEvent) => boolean {
  const {
    enabledRef,
    getMediaTime,
    resolveSegmentInfo,
    addLog,
    lastMouseMoveRef,
    lastWheelRef,
  } = deps;

  return (event: MouseEvent): boolean => {
    if (!enabledRef.current) return true;

    const now = Date.now();
    const mediaTime = getMediaTime();
    const { primaryId, segmentIds } = resolveSegmentInfo(mediaTime);
    const eventType = event.type;

    if (eventType === 'mousedown' || eventType === 'mouseup') {
      const log: MouseClickInputLog = {
        type: eventType === 'mousedown' ? 'MOUSE_DOWN' : 'MOUSE_UP',
        media_time: mediaTime,
        timestamp: now,
        segment_id: primaryId,
        segment_ids: segmentIds,
        button: event.button,
        x: event.clientX,
        y: event.clientY,
      };
      addLog(log);
      return true;
    }

    if (eventType === 'mousemove') {
      const last = lastMouseMoveRef.current;
      const timeDiff = now - last.time;
      const distX = Math.abs(event.clientX - last.x);
      const distY = Math.abs(event.clientY - last.y);
      const dist = Math.sqrt(distX * distX + distY * distY);

      if (
        timeDiff >= MOUSE_MOVE_SAMPLE_INTERVAL &&
        dist >= MOUSE_MOVE_THRESHOLD
      ) {
        const log: MouseMoveInputLog = {
          type: 'MOUSE_MOVE',
          media_time: mediaTime,
          timestamp: now,
          segment_id: primaryId,
          segment_ids: segmentIds,
          x: event.clientX,
          y: event.clientY,
          sampled: true,
        };
        addLog(log);
        lastMouseMoveRef.current = {
          time: now,
          x: event.clientX,
          y: event.clientY,
        };
      }
      return true;
    }

    if (eventType === 'wheel') {
      const wheelEvent = event as WheelEvent;
      if (now - lastWheelRef.current >= WHEEL_SAMPLE_INTERVAL) {
        const log: WheelInputLog = {
          type: 'WHEEL',
          media_time: mediaTime,
          timestamp: now,
          segment_id: primaryId,
          segment_ids: segmentIds,
          deltaX: wheelEvent.deltaX,
          deltaY: wheelEvent.deltaY,
        };
        addLog(log);
        lastWheelRef.current = now;
      }
    }

    return true;
  };
}

// ----------------------------------------
// Gamepad Filter
// ----------------------------------------

export function buildGamepadFilter(
  deps: GamepadFilterDependencies
): (gamepad: Gamepad) => boolean {
  const {
    enabledRef,
    getMediaTime,
    resolveSegmentInfo,
    addLog,
    lastGamepadStateRef,
  } = deps;

  return (gamepad: Gamepad): boolean => {
    if (!enabledRef.current) return true;

    const now = Date.now();
    const mediaTime = getMediaTime();
    const { primaryId, segmentIds } = resolveSegmentInfo(mediaTime);
    const lastState = lastGamepadStateRef.current.get(gamepad.index);

    gamepad.buttons.forEach((button, buttonIndex) => {
      const wasPressed = lastState?.buttons[buttonIndex] ?? false;
      if (button.pressed !== wasPressed) {
        const log: GamepadButtonInputLog = {
          type: 'GAMEPAD_BUTTON',
          media_time: mediaTime,
          timestamp: now,
          segment_id: primaryId,
          segment_ids: segmentIds,
          gamepadIndex: gamepad.index,
          buttonIndex,
          pressed: button.pressed,
          value: button.value,
        };
        addLog(log);
      }
    });

    gamepad.axes.forEach((axisValue, axisIndex) => {
      const lastValue = lastState?.axes[axisIndex] ?? 0;
      if (Math.abs(axisValue - lastValue) >= GAMEPAD_AXIS_THRESHOLD) {
        const log: GamepadAxisInputLog = {
          type: 'GAMEPAD_AXIS',
          media_time: mediaTime,
          timestamp: now,
          segment_id: primaryId,
          segment_ids: segmentIds,
          gamepadIndex: gamepad.index,
          axisIndex,
          value: axisValue,
        };
        addLog(log);
      }
    });

    lastGamepadStateRef.current.set(gamepad.index, {
      buttons: gamepad.buttons.map((button) => button.pressed),
      axes: [...gamepad.axes],
    });

    return true;
  };
}
