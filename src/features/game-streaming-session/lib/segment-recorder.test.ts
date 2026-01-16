import { describe, expect, it } from 'vitest';

import { computeSegmentTiming } from './segment-recorder/index';

describe('computeSegmentTiming', () => {
  it('첫 세그먼트는 앞 오버랩 없이 33초로 기록한다', () => {
    const timing = computeSegmentTiming({
      segmentIndex: 0,
      recordStartMs: 0,
      segmentDurationMs: 30000,
      overlapMs: 3000,
    });

    expect(timing.coreStartMs).toBe(0);
    expect(timing.coreEndMs).toBe(30000);
    expect(timing.recordDurationMs).toBe(33000);
    expect(timing.recordEndMs).toBe(33000);
    expect(timing.nextSegmentDelayMs).toBe(27000);
  });

  it('두 번째 세그먼트는 양쪽 오버랩 포함 36초로 기록한다', () => {
    const timing = computeSegmentTiming({
      segmentIndex: 1,
      recordStartMs: 27000,
      segmentDurationMs: 30000,
      overlapMs: 3000,
    });

    expect(timing.coreStartMs).toBe(30000);
    expect(timing.coreEndMs).toBe(60000);
    expect(timing.recordDurationMs).toBe(36000);
    expect(timing.recordEndMs).toBe(63000);
    expect(timing.nextSegmentDelayMs).toBe(30000);
  });
});
