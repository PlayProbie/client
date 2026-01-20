import { postInputLogs, postPresignedUrl, postUploadComplete } from '../api';
import type { StreamHealthState } from '../hooks/stream/useStreamHealth';
import { UploadQueue } from '../lib/upload/upload-queue';
import type { InputLog } from '../types';
import type {
  UploadWorkerCommand,
  UploadWorkerEvent,
  UploadWorkerSegmentPayload,
} from './upload-worker.types';

interface UploadTask {
  sessionId: string;
  sequence: number;
  segment: UploadWorkerSegmentPayload['segment'];
  contentType: string;
  blob: Blob;
  logs: InputLog[];
  remoteSegmentId?: string;
  s3Url?: string;
  s3Uploaded: boolean;
  completeNotified: boolean;
  logsUploaded: boolean;
}

class UploadRateLimiter {
  private rateBytesPerSecond: number | null = null;
  private capacity = 0;
  private tokens = 0;
  private lastRefill = Date.now();

  setRate(rateBps: number | null): void {
    if (!rateBps || rateBps <= 0) {
      this.rateBytesPerSecond = null;
      this.capacity = 0;
      this.tokens = 0;
      return;
    }

    this.rateBytesPerSecond = rateBps / 8;
    this.capacity = this.rateBytesPerSecond;
    this.tokens = this.capacity;
    this.lastRefill = Date.now();
  }

  isEnabled(): boolean {
    return this.rateBytesPerSecond != null;
  }

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

function sleep(ms: number, signal?: AbortSignal): Promise<void> {
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

function createThrottledStream(
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

const workerContext = self as unknown as {
  postMessage: (event: UploadWorkerEvent) => void;
  onmessage: ((event: MessageEvent<UploadWorkerCommand>) => void) | null;
};

const queue = new UploadQueue<UploadTask>();
const PROCESSING_HEARTBEAT_MS = 500;
let networkStatus: StreamHealthState = 'HEALTHY';
let uploadRateBps: number | null = null;
let streamingActive = true;
let processing = false;
let timerId: ReturnType<typeof setTimeout> | null = null;
let activeAbortController: AbortController | null = null;
let authToken: string | null = null;
const rateLimiter = new UploadRateLimiter();

console.log('[upload.worker] Worker initialized');

function postEvent(event: UploadWorkerEvent): void {
  workerContext.postMessage(event);
}

function notifyQueueSize(): void {
  postEvent({ type: 'queue-size', payload: { size: queue.size() } });
}

function clearTimer(): void {
  if (timerId != null) {
    clearTimeout(timerId);
    timerId = null;
  }
}

function isUploadAllowed(): boolean {
  if (!streamingActive) {
    return true;
  }
  if (networkStatus === 'UNSTABLE') {
    return false;
  }
  if (uploadRateBps == null) {
    return false;
  }
  if (uploadRateBps != null && uploadRateBps <= 0) {
    return false;
  }
  return true;
}

function scheduleNext(): void {
  clearTimer();

  if (processing || !isUploadAllowed()) {
    return;
  }

  const now = Date.now();
  const ready = queue.getNextReady(now);
  if (ready) {
    void processQueue();
    return;
  }

  const nextAt = queue.getNextDueTime();
  if (nextAt == null) {
    return;
  }

  const delay = Math.max(0, nextAt - now);
  timerId = setTimeout(() => {
    timerId = null;
    void processQueue();
  }, delay);
}

async function uploadToS3(
  s3Url: string,
  contentType: string,
  blob: Blob,
  signal: AbortSignal
): Promise<void> {
  const body = createThrottledStream(blob, rateLimiter, signal);
  const response = await fetch(s3Url, {
    method: 'PUT',
    headers: {
      'Content-Type': contentType,
    },
    body,
    signal,
  });

  if (!response.ok) {
    throw new Error(`S3 업로드 실패: ${response.status}`);
  }
}

async function performUpload(task: UploadTask): Promise<{
  remoteSegmentId: string;
  s3Url: string;
}> {
  console.log('[upload.worker] performUpload started', {
    sessionId: task.sessionId,
    segmentId: task.segment.segment_id,
    authToken: authToken ? 'exists' : 'null',
  });

  if (!task.remoteSegmentId || !task.s3Url) {
    // 2. Presigned URL 요청
    console.log('[upload.worker] Requesting presigned URL...');

    const { segmentId: backendSegmentId, s3Url } = await postPresignedUrl(
      task.sessionId,
      {
        sequence: task.sequence,
        video_start_ms: task.segment.start_media_time,
        video_end_ms: task.segment.end_media_time,
        content_type: task.contentType,
      },
      authToken ?? undefined
    );

    console.log('[upload.worker] Presigned URL received', {
      backendSegmentId,
      s3Url,
    });
    task.remoteSegmentId = backendSegmentId;
    task.s3Url = s3Url;
  }

  if (!task.s3Uploaded && task.s3Url) {
    console.log('[upload.worker] Uploading to S3...');
    activeAbortController = new AbortController();
    try {
      await uploadToS3(
        task.s3Url,
        task.contentType,
        task.blob,
        activeAbortController.signal
      );

      task.s3Uploaded = true;
      console.log('[upload.worker] S3 upload completed');
    } finally {
      activeAbortController = null;
    }
  }

  if (!task.completeNotified && task.remoteSegmentId) {
    await postUploadComplete(
      task.sessionId,
      task.remoteSegmentId,
      authToken ?? undefined
    );

    task.completeNotified = true;
  }

  if (!task.logsUploaded && task.remoteSegmentId && task.s3Url) {
    if (task.logs.length > 0) {
      await postInputLogs(
        task.sessionId,
        task.remoteSegmentId,
        task.s3Url,
        task.logs,
        authToken ?? undefined
      );
    }
    task.logsUploaded = true;
    task.logs = [];
  }

  // 6. 로컬 저장소 정리 (성공 시) (processQueue에서 처리하므로 메시지만 전송해도 되지만, 리턴값이 필요함)
  postMessage({ type: 'UPLOAD_SUCCESS', segmentId: task.segment.segment_id });

  return {
    remoteSegmentId: task.remoteSegmentId ?? task.segment.segment_id,
    s3Url: task.s3Url ?? '',
  };
}

async function processQueue(): Promise<void> {
  if (processing || !isUploadAllowed()) {
    return;
  }

  const now = Date.now();
  const nextItem = queue.getNextReady(now);
  if (!nextItem) {
    scheduleNext();
    return;
  }

  processing = true;
  queue.markInFlight(nextItem.key);
  const startedAt = new Date().toISOString();
  postEvent({
    type: 'segment-processing',
    payload: {
      localSegmentId: nextItem.key,
      startedAt,
    },
  });
  const heartbeatId = setInterval(() => {
    postEvent({
      type: 'segment-processing',
      payload: {
        localSegmentId: nextItem.key,
        startedAt: new Date().toISOString(),
      },
    });
  }, PROCESSING_HEARTBEAT_MS);

  try {
    const result = await performUpload(nextItem.payload);
    queue.markDone(nextItem.key);
    postEvent({
      type: 'segment-uploaded',
      payload: {
        localSegmentId: nextItem.key,
        remoteSegmentId: result.remoteSegmentId,
        s3Url: result.s3Url,
      },
    });
  } catch (error) {
    const reason = error instanceof Error ? error.message : String(error);
    const retryScheduled = queue.scheduleRetry(nextItem.key, Date.now());

    if (!retryScheduled) {
      queue.markDone(nextItem.key);
      postEvent({
        type: 'segment-failed',
        payload: {
          localSegmentId: nextItem.key,
          reason,
        },
      });
    }
  } finally {
    clearInterval(heartbeatId);
    processing = false;
    notifyQueueSize();
    scheduleNext();
  }
}

function enqueueSegment(payload: UploadWorkerSegmentPayload): void {
  const localSegmentId = payload.segment.segment_id;

  queue.enqueue(localSegmentId, {
    sessionId: payload.sessionId,
    sequence: payload.sequence,
    segment: payload.segment,
    contentType: payload.contentType,
    blob: payload.blob,
    logs: payload.logs ?? [],
    s3Uploaded: false,
    completeNotified: false,
    logsUploaded: false,
  });

  notifyQueueSize();
  scheduleNext();
}

function setUploadPolicy(params: {
  status: StreamHealthState;
  rateBps: number | null;
  streamingActive: boolean;
}): void {
  networkStatus = params.status;
  streamingActive = params.streamingActive;
  uploadRateBps = params.streamingActive ? params.rateBps : null;
  rateLimiter.setRate(uploadRateBps);

  if (params.streamingActive && params.status === 'UNSTABLE') {
    activeAbortController?.abort();
    clearTimer();
    return;
  }
  scheduleNext();
}

function resetQueue(): void {
  queue.clear();
  clearTimer();
  notifyQueueSize();
}

workerContext.onmessage = (event: MessageEvent<UploadWorkerCommand>) => {
  const message = event.data;
  console.log('[upload.worker] Message received:', message.type);

  switch (message.type) {
    case 'enqueue-segment': {
      enqueueSegment(message.payload);
      break;
    }
    case 'set-network-status': {
      setUploadPolicy(message.payload);
      break;
    }
    case 'flush': {
      scheduleNext();
      break;
    }
    case 'reset': {
      resetQueue();
      break;
    }
    case 'set-auth-token': {
      authToken = message.payload.token;
      console.log(
        '[upload.worker] Auth token received:',
        authToken ? 'exists' : 'null'
      );
      break;
    }
    default: {
      postEvent({
        type: 'error',
        payload: { message: 'Unknown command received' },
      });
    }
  }
};
