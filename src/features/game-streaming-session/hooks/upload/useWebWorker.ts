/**
 * Web Worker Hook
 *
 * 업로드 Web Worker 생성, 메시지 핸들링, 네트워크 상태 동기화를 담당합니다.
 */
import { useCallback, useEffect, useRef } from 'react';

import {
  markPendingUploadPending,
  markPendingUploadProcessing,
  removePendingUpload,
} from '../../lib/upload/upload-sync-store';
import type {
  UploadWorkerCommand,
  UploadWorkerEvent,
} from '../../workers/upload-worker.types';
import type { StreamHealthState } from '../stream/useStreamHealth';

export interface UseWebWorkerOptions {
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

export interface UseWebWorkerReturn {
  workerRef: React.RefObject<Worker | null>;
  releaseUploadThrottle: () => void;
}

export function useWebWorker({
  enabled,
  sessionId,
  streamHealth,
  uploadRateBps,
  streamingActive,
  onError,
  onSegmentUploaded,
  onSegmentFailed,
}: UseWebWorkerOptions): UseWebWorkerReturn {
  const workerRef = useRef<Worker | null>(null);
  const streamHealthRef = useRef(streamHealth);

  // 콜백을 Ref로 래핑하여 Worker useEffect 의존성에서 제거
  const onErrorRef = useRef(onError);
  const onSegmentUploadedRef = useRef(onSegmentUploaded);
  const onSegmentFailedRef = useRef(onSegmentFailed);

  useEffect(() => {
    onErrorRef.current = onError;
  }, [onError]);

  useEffect(() => {
    onSegmentUploadedRef.current = onSegmentUploaded;
  }, [onSegmentUploaded]);

  useEffect(() => {
    onSegmentFailedRef.current = onSegmentFailed;
  }, [onSegmentFailed]);

  useEffect(() => {
    streamHealthRef.current = streamHealth;
  }, [streamHealth]);

  const releaseUploadThrottle = useCallback(() => {
    const worker = workerRef.current;
    if (!worker) return;

    const message: UploadWorkerCommand = {
      type: 'set-network-status',
      payload: {
        status: streamHealthRef.current,
        rateBps: null,
        streamingActive: false,
      },
    };

    worker.postMessage(message);
  }, []);

  // Worker 생성 및 메시지 핸들링
  useEffect(() => {
    if (!enabled || !sessionId) {
      workerRef.current?.terminate();
      workerRef.current = null;
      return;
    }

    const worker = new Worker(
      new URL('../../workers/upload.worker.ts', import.meta.url)
    );

    workerRef.current = worker;

    const handleMessage = (event: MessageEvent<UploadWorkerEvent>) => {
      const message = event.data;

      switch (message.type) {
        case 'segment-uploaded':
          removePendingUpload(message.payload.localSegmentId).catch(() => {});
          onSegmentUploadedRef.current?.(
            message.payload.localSegmentId,
            message.payload.remoteSegmentId,
            message.payload.s3Url
          );
          break;
        case 'segment-processing':
          markPendingUploadProcessing(
            message.payload.localSegmentId,
            'main',
            message.payload.startedAt
          ).catch(() => {});
          break;
        case 'segment-failed':
          markPendingUploadPending(message.payload.localSegmentId).catch(
            () => {}
          );
          onSegmentFailedRef.current?.(
            message.payload.localSegmentId,
            message.payload.reason
          );
          onErrorRef.current?.(new Error(message.payload.reason));
          break;
        case 'error':
          onErrorRef.current?.(new Error(message.payload.message));
          break;
        default:
          break;
      }
    };

    worker.addEventListener('message', handleMessage);

    worker.addEventListener('error', (event) => {
      onErrorRef.current?.(new Error(event.message));
    });

    return () => {
      // Worker terminate 전에 스로틀 해제 메시지 전송
      const releaseMessage: UploadWorkerCommand = {
        type: 'set-network-status',
        payload: {
          status: streamHealthRef.current,
          rateBps: null,
          streamingActive: false,
        },
      };
      worker.postMessage(releaseMessage);

      worker.removeEventListener('message', handleMessage);
      worker.terminate();
      workerRef.current = null;
    };
  }, [enabled, sessionId]);

  // 네트워크 상태 동기화
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

  return {
    workerRef,
    releaseUploadThrottle,
  };
}
