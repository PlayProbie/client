/**
 * SDK 입력 필터 팩토리
 *
 * StreamClient의 inputFilters용 필터 함수를 생성합니다.
 */
import { useCallback, useRef } from 'react';

import type {
  GamepadAxisInputLog,
  GamepadButtonInputLog,
  InputLog,
  KeyboardInputLog,
  MouseClickInputLog,
  MouseMoveInputLog,
  WheelInputLog,
} from '../../types/highlight';
import {
  GAMEPAD_AXIS_THRESHOLD,
  MOUSE_MOVE_SAMPLE_INTERVAL,
  MOUSE_MOVE_THRESHOLD,
  WHEEL_SAMPLE_INTERVAL,
} from './constants';
import type { GamepadState, MouseMoveState } from './types';

export interface CreateInputFiltersOptions {
  /** enabled 상태 ref */
  enabledRef: React.RefObject<boolean>;
  /** 세그먼트 ID ref */
  currentSegmentIdRef: React.RefObject<string>;
  /** media_time getter */
  getMediaTime: () => number;
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
  const { enabledRef, currentSegmentIdRef, getMediaTime, addLog } = options;

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

  // 키보드 필터
  const createKeyboardFilter = useCallback(() => {
    return (event: KeyboardEvent): boolean => {
      // enabledRef로 최신 값 참조 (SDK 필터 고정 문제 해결)
      if (!enabledRef.current) return true;

      const log: KeyboardInputLog = {
        type: event.type === 'keydown' ? 'KEY_DOWN' : 'KEY_UP',
        media_time: getMediaTime(),
        client_ts: Date.now(),
        segment_id: currentSegmentIdRef.current,
        code: event.code,
        key: '', // 보안: event.key 대신 빈 문자열 (민감정보 보호)
      };
      addLog(log);

      // SDK로 전달 허용
      return true;
    };
  }, [enabledRef, currentSegmentIdRef, getMediaTime, addLog]);

  // 마우스 필터
  const createMouseFilter = useCallback(() => {
    return (event: MouseEvent): boolean => {
      // enabledRef로 최신 값 참조
      if (!enabledRef.current) return true;

      const now = Date.now();
      const eventType = event.type;

      // 마우스 클릭 이벤트
      if (eventType === 'mousedown' || eventType === 'mouseup') {
        const log: MouseClickInputLog = {
          type: eventType === 'mousedown' ? 'MOUSE_DOWN' : 'MOUSE_UP',
          media_time: getMediaTime(),
          client_ts: now,
          segment_id: currentSegmentIdRef.current,
          button: event.button,
          x: event.clientX,
          y: event.clientY,
        };
        addLog(log);
        return true;
      }

      // 마우스 이동 이벤트 (샘플링 적용: 15Hz + 5px 임계값)
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
            media_time: getMediaTime(),
            client_ts: now,
            segment_id: currentSegmentIdRef.current,
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

      // 휠 이벤트 (샘플링 적용: 30Hz)
      if (eventType === 'wheel') {
        const wheelEvent = event as unknown as WheelEvent;
        if (now - lastWheelRef.current >= WHEEL_SAMPLE_INTERVAL) {
          const log: WheelInputLog = {
            type: 'WHEEL',
            media_time: getMediaTime(),
            client_ts: now,
            segment_id: currentSegmentIdRef.current,
            deltaX: wheelEvent.deltaX,
            deltaY: wheelEvent.deltaY,
          };
          addLog(log);
          lastWheelRef.current = now;
        }
      }

      return true;
    };
  }, [enabledRef, currentSegmentIdRef, getMediaTime, addLog]);

  // 게임패드 필터
  const createGamepadFilter = useCallback(() => {
    return (gamepad: Gamepad): boolean => {
      // enabledRef로 최신 값 참조
      if (!enabledRef.current) return true;

      const now = Date.now();
      const mediaTime = getMediaTime();
      const lastState = lastGamepadStateRef.current.get(gamepad.index);

      // 버튼 상태 비교
      gamepad.buttons.forEach((button, buttonIndex) => {
        const wasPressed = lastState?.buttons[buttonIndex] ?? false;
        if (button.pressed !== wasPressed) {
          const log: GamepadButtonInputLog = {
            type: 'GAMEPAD_BUTTON',
            media_time: mediaTime,
            client_ts: now,
            segment_id: currentSegmentIdRef.current,
            gamepadIndex: gamepad.index,
            buttonIndex,
            pressed: button.pressed,
            value: button.value,
          };
          addLog(log);
        }
      });

      // 축 상태 비교 (임계값 적용)
      gamepad.axes.forEach((axisValue, axisIndex) => {
        const lastValue = lastState?.axes[axisIndex] ?? 0;
        if (Math.abs(axisValue - lastValue) >= GAMEPAD_AXIS_THRESHOLD) {
          const log: GamepadAxisInputLog = {
            type: 'GAMEPAD_AXIS',
            media_time: mediaTime,
            client_ts: now,
            segment_id: currentSegmentIdRef.current,
            gamepadIndex: gamepad.index,
            axisIndex,
            value: axisValue,
          };
          addLog(log);
        }
      });

      // 상태 저장
      lastGamepadStateRef.current.set(gamepad.index, {
        buttons: gamepad.buttons.map((b) => b.pressed),
        axes: [...gamepad.axes],
      });

      return true;
    };
  }, [enabledRef, currentSegmentIdRef, getMediaTime, addLog]);

  return {
    createKeyboardFilter,
    createMouseFilter,
    createGamepadFilter,
  };
}
