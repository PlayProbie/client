import type { KeyboardInputLog } from '../../../types/highlight';
import type { FilterDependencies } from './types';

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
