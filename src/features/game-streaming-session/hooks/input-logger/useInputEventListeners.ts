import { useEffect } from 'react';

import type { InputLog, VisibilityInputLog } from '../../types/highlight';

/**
 * Visibility 이벤트 리스너 훅
 */
export function useVisibilityListeners(
  enabled: boolean,
  currentSegmentIdRef: React.RefObject<string>,
  getMediaTime: () => number,
  addLog: (log: InputLog) => void
): void {
  useEffect(() => {
    if (!enabled) return;

    const handleVisibilityChange = () => {
      const log: VisibilityInputLog = {
        type: document.hidden ? 'VISIBILITY_HIDDEN' : 'VISIBILITY_VISIBLE',
        media_time: getMediaTime(),
        client_ts: Date.now(),
        segment_id: currentSegmentIdRef.current || '',
        // Use empty string fallback for segment_id if null to match types usually
      };
      addLog(log);
    };

    const handleBlur = () => {
      const log: VisibilityInputLog = {
        type: 'BLUR',
        media_time: getMediaTime(),
        client_ts: Date.now(),
        segment_id: currentSegmentIdRef.current || '',
      };
      addLog(log);
    };

    const handleFocus = () => {
      const log: VisibilityInputLog = {
        type: 'FOCUS',
        media_time: getMediaTime(),
        client_ts: Date.now(),
        segment_id: currentSegmentIdRef.current || '',
      };
      addLog(log);
    };

    const handlePageHide = () => {
      const log: VisibilityInputLog = {
        type: 'PAGE_HIDE',
        media_time: getMediaTime(),
        client_ts: Date.now(),
        segment_id: currentSegmentIdRef.current || '',
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
  }, [enabled, addLog, getMediaTime, currentSegmentIdRef]);
}
