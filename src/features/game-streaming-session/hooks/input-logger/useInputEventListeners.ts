import { useEffect } from 'react';

import type { InputLog, VisibilityInputLog } from '../../types/highlight';
import { createSegmentInfoResolver } from './segment-resolver';

/**
 * Visibility 이벤트 리스너 훅
 */
export function useVisibilityListeners(
  enabled: boolean,
  currentSegmentIdRef: React.RefObject<string>,
  getMediaTime: () => number,
  resolveSegmentIds: ((mediaTimeMs: number) => string[]) | undefined,
  addLog: (log: InputLog) => void
): void {
  useEffect(() => {
    if (!enabled) return;

    const resolveSegmentInfo = createSegmentInfoResolver(
      currentSegmentIdRef,
      resolveSegmentIds
    );

    const handleVisibilityChange = () => {
      const mediaTime = getMediaTime();
      const { primaryId, segmentIds } = resolveSegmentInfo(mediaTime);
      const log: VisibilityInputLog = {
        type: document.hidden ? 'VISIBILITY_HIDDEN' : 'VISIBILITY_VISIBLE',
        media_time: mediaTime,
        client_ts: Date.now(),
        segment_id: primaryId,
        segment_ids: segmentIds,
        // Use empty string fallback for segment_id if null to match types usually
      };
      addLog(log);
    };

    const handleBlur = () => {
      const mediaTime = getMediaTime();
      const { primaryId, segmentIds } = resolveSegmentInfo(mediaTime);
      const log: VisibilityInputLog = {
        type: 'BLUR',
        media_time: mediaTime,
        client_ts: Date.now(),
        segment_id: primaryId,
        segment_ids: segmentIds,
      };
      addLog(log);
    };

    const handleFocus = () => {
      const mediaTime = getMediaTime();
      const { primaryId, segmentIds } = resolveSegmentInfo(mediaTime);
      const log: VisibilityInputLog = {
        type: 'FOCUS',
        media_time: mediaTime,
        client_ts: Date.now(),
        segment_id: primaryId,
        segment_ids: segmentIds,
      };
      addLog(log);
    };

    const handlePageHide = () => {
      const mediaTime = getMediaTime();
      const { primaryId, segmentIds } = resolveSegmentInfo(mediaTime);
      const log: VisibilityInputLog = {
        type: 'PAGE_HIDE',
        media_time: mediaTime,
        client_ts: Date.now(),
        segment_id: primaryId,
        segment_ids: segmentIds,
      };
      addLog(log);
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('blur', handleBlur);
    window.addEventListener('focus', handleFocus);
    window.addEventListener('pagehide', handlePageHide);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('blur', handleBlur);
      window.removeEventListener('focus', handleFocus);
      window.removeEventListener('pagehide', handlePageHide);
    };
  }, [enabled, addLog, getMediaTime, currentSegmentIdRef, resolveSegmentIds]);
}
