import type { RefObject } from 'react';

export interface SegmentInfo {
  primaryId: string;
  segmentIds?: string[];
}

export type SegmentInfoResolver = (mediaTime: number) => SegmentInfo;

export function createSegmentInfoResolver(
  currentSegmentIdRef: RefObject<string>,
  resolveSegmentIds?: (mediaTimeMs: number) => string[]
): SegmentInfoResolver {
  return (mediaTime: number) => {
    const fallbackId = currentSegmentIdRef.current || '';
    const ids = resolveSegmentIds?.(mediaTime) ?? [];
    const filtered = ids.filter(Boolean);
    const primaryId =
      filtered.length > 0 ? filtered[filtered.length - 1] : fallbackId;
    const segmentIds = filtered.length > 1 ? filtered : undefined;
    return { primaryId, segmentIds };
  };
}
