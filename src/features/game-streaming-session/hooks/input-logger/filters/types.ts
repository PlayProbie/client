import type { RefObject } from 'react';

import type { InputLog } from '../../../types/highlight';
import type { SegmentInfoResolver } from '../segment-resolver';
import type { GamepadState, MouseMoveState } from '../types';

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
