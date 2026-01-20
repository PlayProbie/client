import type { InsightQuestionData, ReplayClipSource } from '../types';

export async function preloadReplaySources(
  sessionId: string,
  insightQuestion: InsightQuestionData
): Promise<ReplayClipSource[]> {
  const [{ createSegmentStore }, { findSegmentsByTimeRange }] =
    await Promise.all([
      import('@/features/game-streaming-session/lib/store/segment-store'),
      import('@/features/game-streaming-session/lib/store/segment-store.utils'),
    ]);

  const store = await createSegmentStore({ sessionId });
  const segments = await store.listSegments();
  const targetSegments = findSegmentsByTimeRange(
    segments,
    insightQuestion.videoStartMs,
    insightQuestion.videoEndMs
  ).sort((a, b) => a.start_media_time - b.start_media_time);

  if (targetSegments.length === 0) {
    throw new Error('해당 구간의 영상을 찾을 수 없습니다.');
  }

  const segmentResults = await Promise.all(
    targetSegments.map(async (seg) => {
      const result = await store.getSegment(seg.segment_id);
      return result ? { seg, blob: result.blob } : null;
    })
  );

  const sources: Array<{
    blob: Blob;
    startOffsetMs: number;
    endOffsetMs: number;
  }> = [];
  let lastEndMs = insightQuestion.videoStartMs;

  for (const item of segmentResults) {
    if (!item) continue;

    const segStart =
      item.seg.start_media_time === 0
        ? 0
        : item.seg.start_media_time - item.seg.overlap_ms;
    const segEnd = item.seg.end_media_time + item.seg.overlap_ms;

    const overlapStart = Math.max(insightQuestion.videoStartMs, segStart);
    const overlapEnd = Math.min(insightQuestion.videoEndMs, segEnd);
    const effectiveStart = Math.max(overlapStart, lastEndMs);

    if (overlapEnd > effectiveStart) {
      sources.push({
        blob: item.blob,
        startOffsetMs: effectiveStart - segStart,
        endOffsetMs: overlapEnd - segStart,
      });
      lastEndMs = overlapEnd;
    }

    if (lastEndMs >= insightQuestion.videoEndMs) break;
  }

  if (sources.length === 0) {
    throw new Error('영상 구간 정보를 불러올 수 없습니다.');
  }

  const urlSources: ReplayClipSource[] = [];

  try {
    for (const source of sources) {
      urlSources.push({
        url: URL.createObjectURL(source.blob),
        startOffsetMs: source.startOffsetMs,
        endOffsetMs: source.endOffsetMs,
      });
    }
  } catch (err) {
    for (const source of urlSources) {
      URL.revokeObjectURL(source.url);
    }
    throw err;
  }

  return urlSources;
}
