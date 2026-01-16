import { describe, expect, it } from 'vitest';

import { getRetryDelayMs, UploadQueue } from '../lib/upload/upload-queue';

describe('UploadQueue', () => {
  it('FIFO 순서로 대기열을 처리한다', () => {
    const queue = new UploadQueue<string>();

    queue.enqueue('seg-a', 'payload-a', 0);
    queue.enqueue('seg-b', 'payload-b', 10);

    const first = queue.getNextReady(0);
    expect(first?.key).toBe('seg-a');

    queue.markDone('seg-a');

    const second = queue.getNextReady(0);
    expect(second?.key).toBe('seg-b');
  });

  it('지수 백오프로 재시도 시간을 설정한다', () => {
    const queue = new UploadQueue<string>();
    queue.enqueue('seg-a', 'payload-a', 0);

    const first = queue.getNextReady(0);
    expect(first?.key).toBe('seg-a');

    const scheduled = queue.scheduleRetry('seg-a', 0);
    expect(scheduled).toBe(true);

    const item = queue.getItem('seg-a');
    expect(item?.retryCount).toBe(1);
    expect(item?.nextAttemptAt).toBe(1000);

    expect(queue.getNextReady(999)).toBeNull();
    expect(queue.getNextReady(1000)?.key).toBe('seg-a');
  });

  it('최대 재시도 횟수를 초과하면 false를 반환한다', () => {
    const queue = new UploadQueue<string>({ maxRetries: 3 });
    queue.enqueue('seg-a', 'payload-a', 0);

    expect(queue.scheduleRetry('seg-a', 0)).toBe(true);
    expect(queue.scheduleRetry('seg-a', 1000)).toBe(true);
    expect(queue.scheduleRetry('seg-a', 3000)).toBe(true);
    expect(queue.scheduleRetry('seg-a', 7000)).toBe(false);
  });
});

describe('getRetryDelayMs', () => {
  it('재시도 횟수에 따라 1s, 2s, 4s 지연을 반환한다', () => {
    expect(getRetryDelayMs(1)).toBe(1000);
    expect(getRetryDelayMs(2)).toBe(2000);
    expect(getRetryDelayMs(3)).toBe(4000);
  });
});
