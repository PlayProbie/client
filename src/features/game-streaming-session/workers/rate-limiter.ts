/**
 * Rate Limiter
 *
 * Token Bucket 알고리즘 기반 업로드 속도 제한.
 * 스트리밍 중 대역폭을 보호하기 위해 업로드 속도를 조절합니다.
 */

/**
 * AbortSignal을 지원하는 sleep 함수
 */
export function sleep(ms: number, signal?: AbortSignal): Promise<void> {
  return new Promise((resolve, reject) => {
    if (signal?.aborted) {
      reject(new DOMException('Aborted', 'AbortError'));
      return;
    }

    const timer = setTimeout(() => {
      if (signal) {
        signal.removeEventListener('abort', onAbort);
      }
      resolve();
    }, ms);

    const onAbort = () => {
      clearTimeout(timer);
      if (signal) {
        signal.removeEventListener('abort', onAbort);
      }
      reject(new DOMException('Aborted', 'AbortError'));
    };

    if (signal) {
      signal.addEventListener('abort', onAbort, { once: true });
    }
  });
}

/**
 * Token Bucket 기반 Rate Limiter
 */
export class UploadRateLimiter {
  private rateBytesPerSecond: number | null = null;
  private capacity = 0;
  private tokens = 0;
  private lastRefill = Date.now();

  /**
   * 업로드 속도 설정
   * @param rateBps 초당 비트 수 (bits per second)
   */
  setRate(rateBps: number | null): void {
    if (!rateBps || rateBps <= 0) {
      this.rateBytesPerSecond = null;
      this.capacity = 0;
      this.tokens = 0;
      return;
    }

    this.rateBytesPerSecond = rateBps / 8; // bps → Bytes/s
    this.capacity = this.rateBytesPerSecond;
    this.tokens = this.capacity;
    this.lastRefill = Date.now();
  }

  /**
   * Rate limiting이 활성화되어 있는지 확인
   */
  isEnabled(): boolean {
    return this.rateBytesPerSecond != null;
  }

  /**
   * 시간 경과에 따라 토큰 보충
   */
  private refill(): void {
    if (!this.rateBytesPerSecond) return;
    const now = Date.now();
    const elapsedSeconds = (now - this.lastRefill) / 1000;
    if (elapsedSeconds <= 0) return;
    this.lastRefill = now;
    this.tokens = Math.min(
      this.capacity,
      this.tokens + this.rateBytesPerSecond * elapsedSeconds
    );
  }

  /**
   * 바이트 소비 (토큰 부족 시 대기)
   * @param bytes 소비할 바이트 수
   * @param signal 취소 시그널
   */
  async consume(bytes: number, signal?: AbortSignal): Promise<void> {
    if (!this.rateBytesPerSecond) return;
    if (bytes <= 0) return;

    let remaining = bytes;
    const capacity =
      this.capacity > 0 ? this.capacity : this.rateBytesPerSecond;

    while (remaining > 0) {
      if (signal?.aborted) {
        throw new DOMException('Aborted', 'AbortError');
      }

      this.refill();
      const target = Math.min(remaining, capacity);
      if (this.tokens < target) {
        const deficit = target - this.tokens;
        const waitMs = Math.ceil((deficit / this.rateBytesPerSecond) * 1000);
        await sleep(waitMs, signal);
        continue;
      }

      this.tokens -= target;
      remaining -= target;
    }
  }
}

/**
 * Rate-limited ReadableStream 생성
 * Blob을 청크 단위로 읽으면서 rate limit 적용
 */
export function createThrottledStream(
  blob: Blob,
  limiter: UploadRateLimiter,
  signal?: AbortSignal
): ReadableStream<Uint8Array> | Blob {
  if (!limiter.isEnabled() || typeof blob.stream !== 'function') {
    return blob;
  }

  const reader = blob.stream().getReader();

  return new ReadableStream<Uint8Array>({
    async pull(controller) {
      if (signal?.aborted) {
        controller.error(new DOMException('Aborted', 'AbortError'));
        return;
      }

      const { value, done } = await reader.read();
      if (done) {
        controller.close();
        return;
      }

      if (value) {
        await limiter.consume(value.byteLength, signal);
        controller.enqueue(value);
      }
    },
    cancel() {
      void reader.cancel();
    },
  });
}
