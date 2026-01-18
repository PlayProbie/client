import { describe, expect, it } from 'vitest';

import { createSegmentStore } from '../lib/store/segment-store';

function createSegmentMeta(segmentId: string, start: number) {
  return {
    segment_id: segmentId,
    session_id: 'session-1',
    start_media_time: start,
    end_media_time: start + 30000,
    upload_status: 'LOCAL_ONLY' as const,
    overlap_ms: 3000,
    created_at: new Date().toISOString(),
  };
}

function createBlob(size: number) {
  return new Blob([new Uint8Array(size)]);
}

describe('SegmentStore (memory backend)', () => {
  it('세그먼트를 저장하고 삭제할 수 있다', async () => {
    const store = await createSegmentStore({
      sessionId: 'session-1',
      backend: 'memory',
      maxStorageBytes: 1024,
    });

    const meta = createSegmentMeta('seg-a', 0);
    await store.saveSegment(meta, createBlob(200));

    const result = await store.getSegment('seg-a');
    expect(result?.meta.segment_id).toBe('seg-a');
    expect(result?.blob.size).toBe(200);

    await store.deleteSegment('seg-a');
    const deleted = await store.getSegment('seg-a');
    expect(deleted).toBeNull();
  });

  it('저장 용량을 초과하면 LRU로 삭제한다', async () => {
    const store = await createSegmentStore({
      sessionId: 'session-1',
      backend: 'memory',
      maxStorageBytes: 400,
    });

    await store.saveSegment(createSegmentMeta('seg-a', 0), createBlob(200));
    await store.saveSegment(createSegmentMeta('seg-b', 30000), createBlob(200));
    await store.saveSegment(createSegmentMeta('seg-c', 60000), createBlob(200));

    const segments = await store.listSegments();
    const ids = segments.map((segment) => segment.segment_id);
    expect(ids).not.toContain('seg-a');
    expect(ids).toContain('seg-b');
    expect(ids).toContain('seg-c');
  });
});
