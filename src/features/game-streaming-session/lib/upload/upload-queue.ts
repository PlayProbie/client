export const DEFAULT_MAX_UPLOAD_RETRIES = 5;
export const DEFAULT_RETRY_BASE_DELAY_MS = 1000;
export const DEFAULT_RETRY_MAX_DELAY_MS = 4000;

export function getRetryDelayMs(
  retryCount: number,
  baseDelayMs: number = DEFAULT_RETRY_BASE_DELAY_MS,
  maxDelayMs: number = DEFAULT_RETRY_MAX_DELAY_MS
): number {
  if (retryCount <= 0) {
    return 0;
  }
  const delay = baseDelayMs * Math.pow(2, retryCount - 1);
  return Math.min(delay, maxDelayMs);
}

export interface UploadQueueItem<TPayload> {
  key: string;
  payload: TPayload;
  retryCount: number;
  nextAttemptAt: number;
  createdAt: number;
  inFlight: boolean;
}

export interface UploadQueueOptions {
  maxRetries?: number;
  baseDelayMs?: number;
  maxDelayMs?: number;
}

export class UploadQueue<TPayload> {
  private readonly items = new Map<string, UploadQueueItem<TPayload>>();
  private readonly order: string[] = [];
  private readonly maxRetries: number;
  private readonly baseDelayMs: number;
  private readonly maxDelayMs: number;

  constructor(options: UploadQueueOptions = {}) {
    this.maxRetries = options.maxRetries ?? DEFAULT_MAX_UPLOAD_RETRIES;
    this.baseDelayMs = options.baseDelayMs ?? DEFAULT_RETRY_BASE_DELAY_MS;
    this.maxDelayMs = options.maxDelayMs ?? DEFAULT_RETRY_MAX_DELAY_MS;
  }

  enqueue(
    key: string,
    payload: TPayload,
    now: number = Date.now(),
    merge?: (current: TPayload, incoming: TPayload) => TPayload
  ): UploadQueueItem<TPayload> {
    const existing = this.items.get(key);
    if (existing) {
      existing.payload = merge ? merge(existing.payload, payload) : payload;
      return existing;
    }

    const item: UploadQueueItem<TPayload> = {
      key,
      payload,
      retryCount: 0,
      nextAttemptAt: now,
      createdAt: now,
      inFlight: false,
    };

    this.items.set(key, item);
    this.order.push(key);
    return item;
  }

  getNextReady(now: number = Date.now()): UploadQueueItem<TPayload> | null {
    for (const key of this.order) {
      const item = this.items.get(key);
      if (!item || item.inFlight) continue;
      if (item.nextAttemptAt <= now) {
        return item;
      }
    }
    return null;
  }

  getNextDueTime(): number | null {
    let nextTime: number | null = null;
    for (const key of this.order) {
      const item = this.items.get(key);
      if (!item || item.inFlight) continue;
      if (nextTime == null || item.nextAttemptAt < nextTime) {
        nextTime = item.nextAttemptAt;
      }
    }
    return nextTime;
  }

  markInFlight(key: string): void {
    const item = this.items.get(key);
    if (item) {
      item.inFlight = true;
    }
  }

  scheduleRetry(key: string, now: number = Date.now()): boolean {
    const item = this.items.get(key);
    if (!item) return false;

    const nextRetryCount = item.retryCount + 1;
    if (nextRetryCount > this.maxRetries) {
      return false;
    }

    item.retryCount = nextRetryCount;
    item.nextAttemptAt =
      now + getRetryDelayMs(nextRetryCount, this.baseDelayMs, this.maxDelayMs);
    item.inFlight = false;
    return true;
  }

  /**
   * Abort 에러 시 retryCount를 증가시키지 않고 재시도 스케줄링
   * UNSTABLE 상태에서 abort된 경우 실제 실패가 아니므로 retryCount를 소모하지 않음
   */
  scheduleRetryWithoutIncrement(
    key: string,
    now: number = Date.now()
  ): boolean {
    const item = this.items.get(key);
    if (!item) return false;

    // retryCount가 이미 maxRetries를 초과한 경우에만 실패 처리
    if (item.retryCount > this.maxRetries) {
      return false;
    }

    // retryCount를 증가시키지 않고 딜레이만 적용
    item.nextAttemptAt =
      now +
      getRetryDelayMs(
        item.retryCount > 0 ? item.retryCount : 1,
        this.baseDelayMs,
        this.maxDelayMs
      );
    item.inFlight = false;
    return true;
  }

  markDone(key: string): void {
    if (!this.items.has(key)) return;
    this.items.delete(key);
    const index = this.order.indexOf(key);
    if (index >= 0) {
      this.order.splice(index, 1);
    }
  }

  size(): number {
    return this.items.size;
  }

  clear(): void {
    this.items.clear();
    this.order.length = 0;
  }

  getItem(key: string): UploadQueueItem<TPayload> | null {
    return this.items.get(key) ?? null;
  }
}
