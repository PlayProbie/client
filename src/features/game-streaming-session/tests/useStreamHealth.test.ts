/**
 * @vitest-environment jsdom
 */
import { describe, expect, it } from 'vitest';

import { evaluateStreamHealth } from '../hooks/stream/useStreamHealth';

describe('evaluateStreamHealth', () => {
  it('HEALTHY 조건을 만족하면 HEALTHY를 반환한다', () => {
    expect(evaluateStreamHealth(1.9, 99)).toBe('HEALTHY');
  });

  it('packetLoss가 2% 이상이면 DEGRADED로 분류한다', () => {
    expect(evaluateStreamHealth(2, 50)).toBe('DEGRADED');
  });

  it('DEGRADED 조건을 만족하면 DEGRADED를 반환한다', () => {
    expect(evaluateStreamHealth(4.9, 199)).toBe('DEGRADED');
  });

  it('packetLoss가 5% 이상이면 UNSTABLE로 분류한다', () => {
    expect(evaluateStreamHealth(5, 50)).toBe('UNSTABLE');
  });

  it('RTT가 200ms 이상이면 UNSTABLE로 분류한다', () => {
    expect(evaluateStreamHealth(1, 200)).toBe('UNSTABLE');
  });

  it('지표가 누락되면 UNSTABLE로 분류한다', () => {
    expect(evaluateStreamHealth(null, 50)).toBe('UNSTABLE');
    expect(evaluateStreamHealth(1, null)).toBe('UNSTABLE');
  });
});
