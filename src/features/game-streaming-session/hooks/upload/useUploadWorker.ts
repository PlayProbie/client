import { useCallback, useEffect, useRef } from 'react';

import type { InputLog, SegmentMeta } from '../../types';
import type {
  UploadWorkerCommand,
  UploadWorkerEvent,
  UploadWorkerSegmentPayload,
} from '../../workers/upload-worker.types';
import type { StreamHealthState } from '../stream/useStreamHealth';

export interface UseUploadWorkerOptions {
  enabled: boolean;
  sessionId: string | null;
  streamHealth: StreamHealthState;
  uploadRateBps: number | null;
  streamingActive: boolean;
  onError?: (error: Error) => void;
  onSegmentUploaded?: (
    localSegmentId: string,
    remoteSegmentId: string,
    s3Url: string
  ) => void;
  onSegmentFailed?: (segmentId: string, reason: string) => void;
}

export interface UseUploadWorkerReturn {
  enqueueSegment: (
    segment: SegmentMeta,
    blob: Blob,
    logs?: InputLog[],
    contentType?: string
  ) => void;
  flush: () => void;
  reset: () => void;
}

export function useUploadWorker({
  enabled,
  sessionId,
  streamHealth,
  uploadRateBps,
  streamingActive,
  onError,
  onSegmentUploaded,
  onSegmentFailed,
}: UseUploadWorkerOptions): UseUploadWorkerReturn {
  const workerRef = useRef<Worker | null>(null);
  const sequenceRef = useRef(0);

  useEffect(() => {
    sequenceRef.current = 0;
  }, [sessionId]);

  useEffect(() => {
    if (!enabled || !sessionId) {
      workerRef.current?.terminate();
      workerRef.current = null;
      return;
    }

    const worker = new Worker(
      new URL('../../workers/upload.worker.ts', import.meta.url),
      { type: 'module' }
    );

    workerRef.current = worker;

    const handleMessage = (event: MessageEvent<UploadWorkerEvent>) => {
      const message = event.data;

      switch (message.type) {
        case 'segment-uploaded':
          onSegmentUploaded?.(
            message.payload.localSegmentId,
            message.payload.remoteSegmentId,
            message.payload.s3Url
          );
          break;
        case 'segment-failed':
          onSegmentFailed?.(
            message.payload.localSegmentId,
            message.payload.reason
          );
          onError?.(new Error(message.payload.reason));
          break;
        case 'error':
          onError?.(new Error(message.payload.message));
          break;
        default:
          break;
      }
    };

    worker.addEventListener('message', handleMessage);

    worker.addEventListener('error', (event) => {
      onError?.(new Error(event.message));
    });

    return () => {
      worker.removeEventListener('message', handleMessage);
      worker.terminate();
      workerRef.current = null;
    };
  }, [enabled, sessionId, onError, onSegmentFailed, onSegmentUploaded]);

  useEffect(() => {
    const worker = workerRef.current;
    if (!worker) return;

    const message: UploadWorkerCommand = {
      type: 'set-network-status',
      payload: {
        status: streamHealth,
        rateBps: uploadRateBps,
        streamingActive,
      },
    };

    worker.postMessage(message);
  }, [streamHealth, uploadRateBps, streamingActive]);

  const enqueueSegment = useCallback(
    (
      segment: SegmentMeta,
      blob: Blob,
      logs: InputLog[] = [],
      contentType?: string
    ) => {
      const worker = workerRef.current;
      if (!worker || !sessionId) return;

      const payload: UploadWorkerSegmentPayload = {
        sessionId,
        sequence: sequenceRef.current,
        segment,
        contentType: contentType || blob.type || 'video/webm',
        blob,
        logs,
      };

      sequenceRef.current += 1;

      const message: UploadWorkerCommand = {
        type: 'enqueue-segment',
        payload,
      };

      worker.postMessage(message);
    },
    [sessionId]
  );

  const flush = useCallback(() => {
    const worker = workerRef.current;
    if (!worker) return;

    const message: UploadWorkerCommand = { type: 'flush' };
    worker.postMessage(message);
  }, []);

  const reset = useCallback(() => {
    const worker = workerRef.current;
    if (!worker) return;

    const message: UploadWorkerCommand = { type: 'reset' };
    worker.postMessage(message);
  }, []);

  return {
    enqueueSegment,
    flush,
    reset,
  };
}
