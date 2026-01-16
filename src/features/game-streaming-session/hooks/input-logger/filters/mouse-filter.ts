import type {
  MouseClickInputLog,
  MouseMoveInputLog,
  WheelInputLog,
} from '../../../types/highlight';
import {
  MOUSE_MOVE_SAMPLE_INTERVAL,
  MOUSE_MOVE_THRESHOLD,
  WHEEL_SAMPLE_INTERVAL,
} from '../constants';
import type { MouseFilterDependencies } from './types';

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
        client_ts: now,
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
          client_ts: now,
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
          client_ts: now,
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
