/**
 * Segment Store 유틸리티 함수
 */

import type { SegmentMeta } from '../../types';

/**
 * 주어진 mediaTime에 해당하는 세그먼트를 찾습니다.
 * 오버랩을 고려하여 가장 적합한 세그먼트를 반환합니다.
 *
 * @param segments 세그먼트 메타 배열
 * @param mediaTimeMs 찾고자 하는 미디어 시간 (ms)
 * @returns 해당 시간을 포함하는 세그먼트 또는 null
 */
export function findSegmentByMediaTime(
  segments: SegmentMeta[],
  mediaTimeMs: number
): SegmentMeta | null {
  if (segments.length === 0) {
    return null;
  }

  // 세그먼트 시간 순 정렬
  const sorted = [...segments].sort(
    (a, b) => a.start_media_time - b.start_media_time
  );

  // 해당 시간을 포함하는 세그먼트 찾기
  // 오버랩 고려: 실제 녹화 범위는 [start - overlap, end + overlap]
  // 후보 세그먼트들을 수집
  const candidates: SegmentMeta[] = [];

  for (const segment of sorted) {
    // 첫 세그먼트(0)는 앞 오버랩 없음
    const actualStart =
      segment.start_media_time === 0
        ? 0
        : segment.start_media_time - segment.overlap_ms;
    const actualEnd = segment.end_media_time + segment.overlap_ms;

    if (mediaTimeMs >= actualStart && mediaTimeMs <= actualEnd) {
      candidates.push(segment);
    }
  }

  if (candidates.length === 0) {
    // 정확한 범위 내 세그먼트가 없으면 가장 가까운 세그먼트 반환 로직으로 이동
  } else {
    // 1. Core Range (start ~ end) 내에 있는 세그먼트 우선
    const coreMatch = candidates.find(
      (seg) =>
        mediaTimeMs >= seg.start_media_time && mediaTimeMs < seg.end_media_time
    );
    if (coreMatch) return coreMatch;

    // 2. 없으면 첫 번째 후보 (Overlap 구간)
    return candidates[0];
  }

  // 정확한 범위 내 세그먼트가 없으면 가장 가까운 세그먼트 반환
  let closestSegment: SegmentMeta | null = null;
  let minDistance = Infinity;

  for (const segment of sorted) {
    const midPoint = (segment.start_media_time + segment.end_media_time) / 2;
    const distance = Math.abs(mediaTimeMs - midPoint);

    if (distance < minDistance) {
      minDistance = distance;
      closestSegment = segment;
    }
  }

  return closestSegment;
}

/**
 * 주어진 시간 범위에 해당하는 모든 세그먼트를 찾습니다.
 *
 * @param segments 세그먼트 메타 배열
 * @param startMs 시작 시간 (ms)
 * @param endMs 종료 시간 (ms)
 * @returns 해당 범위를 포함하는 세그먼트 배열
 */
export function findSegmentsByTimeRange(
  segments: SegmentMeta[],
  startMs: number,
  endMs: number
): SegmentMeta[] {
  return segments.filter((segment) => {
    const actualStart = segment.start_media_time - segment.overlap_ms;
    const actualEnd = segment.end_media_time + segment.overlap_ms;

    // 범위가 겹치는 모든 세그먼트 포함
    return actualEnd >= startMs && actualStart <= endMs;
  });
}
