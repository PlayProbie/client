export interface SegmentTimingInput {
  segmentIndex: number;
  recordStartMs: number;
  segmentDurationMs: number;
  overlapMs: number;
}

export interface SegmentTimingResult {
  coreStartMs: number;
  coreEndMs: number;
  recordDurationMs: number;
  recordEndMs: number;
  nextSegmentDelayMs: number;
}

export function computeSegmentTiming({
  segmentIndex,
  recordStartMs,
  segmentDurationMs,
  overlapMs,
}: SegmentTimingInput): SegmentTimingResult {
  const isFirst = segmentIndex === 0;
  const coreStartMs = isFirst ? recordStartMs : recordStartMs + overlapMs;
  const coreEndMs = coreStartMs + segmentDurationMs;
  const recordDurationMs = isFirst
    ? segmentDurationMs + overlapMs
    : segmentDurationMs + overlapMs * 2;
  const recordEndMs = recordStartMs + recordDurationMs;
  const nextSegmentDelayMs = isFirst
    ? segmentDurationMs - overlapMs
    : segmentDurationMs;

  return {
    coreStartMs,
    coreEndMs,
    recordDurationMs,
    recordEndMs,
    nextSegmentDelayMs,
  };
}
