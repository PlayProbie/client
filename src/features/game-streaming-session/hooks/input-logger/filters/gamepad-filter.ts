import type {
  GamepadAxisInputLog,
  GamepadButtonInputLog,
} from '../../../types/highlight';
import { GAMEPAD_AXIS_THRESHOLD } from '../constants';
import type { GamepadFilterDependencies } from './types';

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
          client_ts: now,
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
          client_ts: now,
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
