/**
 * Upload Worker
 *
 * 세그먼트 업로드 큐 처리 및 메시지 핸들링.
 */
import type { StreamHealthState } from '../hooks/stream/useStreamHealth';
import { UploadQueue } from '../lib/upload/upload-queue';
import { performUpload, type UploadTask } from './upload-task';
import type {
  UploadWorkerCommand,
  UploadWorkerEvent,
  UploadWorkerSegmentPayload,
} from './upload-worker.types';

// Worker Context
const workerContext = self as unknown as {
  postMessage: (event: UploadWorkerEvent) => void;
  onmessage: ((event: MessageEvent<UploadWorkerCommand>) => void) | null;
};

// 상수
const PROCESSING_HEARTBEAT_MS = 500;

// 상태 변수
const queue = new UploadQueue<UploadTask>();
let networkStatus: StreamHealthState = 'HEALTHY';
let uploadRateBps: number | null = null;
let streamingActive = true;
let processing = false;
let timerId: ReturnType<typeof setTimeout> | null = null;
let activeAbortController: AbortController | null = null;

// 이벤트 헬퍼
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

// 업로드 정책
function isUploadAllowed(): boolean {
  if (!streamingActive) {
    return true;
  }
  if (networkStatus !== 'HEALTHY') {
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

// 스케줄링
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

// 큐 처리
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
    payload: { localSegmentId: nextItem.key, startedAt },
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
    const result = await performUpload({
      task: nextItem.payload,
      getAbortController: () => {
        activeAbortController = new AbortController();
        return activeAbortController;
      },
      clearAbortController: () => {
        activeAbortController = null;
      },
    });

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

    // Abort 에러인지 확인 (UNSTABLE 상태에서 abort된 경우)
    const isAbortError =
      error instanceof Error &&
      (error.name === 'AbortError' || reason.includes('aborted'));

    // Abort 에러가 아닌 경우에만 retryCount 증가
    const retryScheduled = isAbortError
      ? queue.scheduleRetryWithoutIncrement(nextItem.key, Date.now())
      : queue.scheduleRetry(nextItem.key, Date.now());

    if (!retryScheduled) {
      queue.markDone(nextItem.key);
      postEvent({
        type: 'segment-failed',
        payload: { localSegmentId: nextItem.key, reason },
      });
    }
  } finally {
    clearInterval(heartbeatId);
    processing = false;
    notifyQueueSize();
    scheduleNext();
  }
}

// 커맨드 핸들러
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

  // HEALTHY가 아닌 상태에서는 진행 중 업로드 즉시 중단
  if (params.streamingActive && params.status !== 'HEALTHY') {
    if (activeAbortController) {
      activeAbortController.abort();
    }
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

// 메시지 핸들러
workerContext.onmessage = (event: MessageEvent<UploadWorkerCommand>) => {
  const message = event.data;

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
    default: {
      postEvent({
        type: 'error',
        payload: { message: 'Unknown command received' },
      });
    }
  }
};
