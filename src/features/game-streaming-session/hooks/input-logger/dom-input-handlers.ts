import type {
  InputLog,
  KeyboardInputLog,
  MouseClickInputLog,
  MouseMoveInputLog,
  WheelInputLog,
} from '../../types/highlight';
import {
  MOUSE_MOVE_SAMPLE_INTERVAL,
  MOUSE_MOVE_THRESHOLD,
  WHEEL_SAMPLE_INTERVAL,
} from './constants';
import type { SegmentInfoResolver } from './segment-resolver';
import type { MouseMoveState } from './types';

interface DomInputHandlerOptions {
  getMediaTime: () => number;
  resolveSegmentInfo: SegmentInfoResolver;
  addLog: (log: InputLog) => void;
  lastMouseMoveRef: React.MutableRefObject<MouseMoveState>;
  lastWheelRef: React.MutableRefObject<number>;
}

export function createDomInputHandlers(options: DomInputHandlerOptions) {
  const {
    getMediaTime,
    resolveSegmentInfo,
    addLog,
    lastMouseMoveRef,
    lastWheelRef,
  } = options;

  const now = () => Date.now();

  const handleKeyDown = (event: KeyboardEvent) => {
    const mediaTime = getMediaTime();
    const { primaryId, segmentIds } = resolveSegmentInfo(mediaTime);
    const log: KeyboardInputLog = {
      type: 'KEY_DOWN',
      media_time: mediaTime,
      timestamp: now(),
      segment_id: primaryId,
      segment_ids: segmentIds,
      code: event.code,
      key: '', // 보안: 민감정보 보호
    };
    addLog(log);
  };

  const handleKeyUp = (event: KeyboardEvent) => {
    const mediaTime = getMediaTime();
    const { primaryId, segmentIds } = resolveSegmentInfo(mediaTime);
    const log: KeyboardInputLog = {
      type: 'KEY_UP',
      media_time: mediaTime,
      timestamp: now(),
      segment_id: primaryId,
      segment_ids: segmentIds,
      code: event.code,
      key: '', // 보안: 민감정보 보호
    };
    addLog(log);
  };

  const handleMouseDown = (event: MouseEvent) => {
    const mediaTime = getMediaTime();
    const { primaryId, segmentIds } = resolveSegmentInfo(mediaTime);
    const log: MouseClickInputLog = {
      type: 'MOUSE_DOWN',
      media_time: mediaTime,
      timestamp: now(),
      segment_id: primaryId,
      segment_ids: segmentIds,
      button: event.button,
      x: event.clientX,
      y: event.clientY,
    };
    addLog(log);
  };

  const handleMouseUp = (event: MouseEvent) => {
    const mediaTime = getMediaTime();
    const { primaryId, segmentIds } = resolveSegmentInfo(mediaTime);
    const log: MouseClickInputLog = {
      type: 'MOUSE_UP',
      media_time: mediaTime,
      timestamp: now(),
      segment_id: primaryId,
      segment_ids: segmentIds,
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
      const mediaTime = getMediaTime();
      const { primaryId, segmentIds } = resolveSegmentInfo(mediaTime);
      const log: MouseMoveInputLog = {
        type: 'MOUSE_MOVE',
        media_time: mediaTime,
        timestamp: currentTime,
        segment_id: primaryId,
        segment_ids: segmentIds,
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
      const mediaTime = getMediaTime();
      const { primaryId, segmentIds } = resolveSegmentInfo(mediaTime);
      const log: WheelInputLog = {
        type: 'WHEEL',
        media_time: mediaTime,
        timestamp: currentTime,
        segment_id: primaryId,
        segment_ids: segmentIds,
        deltaX: event.deltaX,
        deltaY: event.deltaY,
      };
      addLog(log);
      lastWheelRef.current = currentTime;
    }
  };

  return {
    handleKeyDown,
    handleKeyUp,
    handleMouseDown,
    handleMouseUp,
    handleMouseMove,
    handleWheel,
  };
}
