import { useCallback, useEffect, useRef } from 'react';

import {
  addPendingUpload,
  removePendingUpload,
} from '../../lib/upload/upload-sync-store';
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

// Shared Worker 지원 여부 확인
function supportsSharedWorker(): boolean {
  return typeof SharedWorker !== 'undefined';
}

// Service Worker 등록
async function registerServiceWorker(
  apiUrl: string
): Promise<ServiceWorkerRegistration | null> {
  if (!('serviceWorker' in navigator)) {
    return null;
  }

  try {
    const swPath = `/upload-sw.js?apiUrl=${encodeURIComponent(apiUrl)}`;
    const registration = await navigator.serviceWorker.register(swPath);
    return registration;
  } catch {
    return null;
  }
}

// Background Sync 트리거
async function triggerBackgroundSync(): Promise<void> {
  if (!('serviceWorker' in navigator) || !('SyncManager' in window)) {
    return;
  }

  try {
    const registration = await navigator.serviceWorker.ready;
    // @ts-expect-error - SyncManager types are not complete
    await registration.sync.register('upload-segments');
  } catch {
    // Fallback: SW에 직접 메시지 전송
    const registration = await navigator.serviceWorker.ready;
    registration.active?.postMessage({ type: 'PROCESS_UPLOADS' });
  }
}

// Shared Worker 또는 Service Worker에 업로드 요청
function triggerSharedOrServiceWorkerUpload(
  sharedWorker: SharedWorker | null
): void {
  if (sharedWorker) {
    sharedWorker.port.postMessage({ type: 'PROCESS_UPLOADS' });
  } else {
    triggerBackgroundSync().catch(() => {
      // 백그라운드 동기화 실패는 무시
    });
  }
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
  const sharedWorkerRef = useRef<SharedWorker | null>(null);
  const sequenceRef = useRef(0);
  const swRegistrationRef = useRef<ServiceWorkerRegistration | null>(null);
  const streamHealthRef = useRef(streamHealth);

  useEffect(() => {
    sequenceRef.current = 0;
  }, [sessionId]);

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

  // Service Worker 및 Shared Worker 등록
  useEffect(() => {
    if (!enabled) return;

    // Service Worker 등록 (Chrome/Edge Background Sync)
    const apiUrl = import.meta.env.VITE_API_BASE_URL;
    registerServiceWorker(apiUrl).then((registration) => {
      swRegistrationRef.current = registration;
    });

    // Shared Worker 등록 (Safari/Firefox 폴백)
    if (supportsSharedWorker()) {
      try {
        const sharedWorker = new SharedWorker(
          new URL('../../workers/upload-shared-worker.ts', import.meta.url),
          { type: 'module', name: 'upload-shared-worker' }
        );

        sharedWorker.port.onmessage = (event) => {
          const message = event.data;
          if (message.type === 'SEGMENT_UPLOADED') {
            removePendingUpload(message.payload.localSegmentId).catch(() => {});
            onSegmentUploaded?.(
              message.payload.localSegmentId,
              message.payload.remoteSegmentId,
              message.payload.s3Url
            );
          } else if (message.type === 'SEGMENT_FAILED') {
            onSegmentFailed?.(
              message.payload.localSegmentId,
              message.payload.reason
            );
          }
        };

        sharedWorker.port.start();
        sharedWorkerRef.current = sharedWorker;
      } catch {
        // Shared Worker 초기화 실패는 무시 (폴백 사용)
      }
    }

    return () => {
      if (sharedWorkerRef.current) {
        sharedWorkerRef.current.port.close();
        sharedWorkerRef.current = null;
      }
    };
  }, [enabled, onSegmentUploaded, onSegmentFailed]);

  // pagehide 이벤트에서 Background Sync 또는 Shared Worker 트리거
  useEffect(() => {
    if (!enabled || !sessionId) return;

    const handlePageHide = () => {
      releaseUploadThrottle();
      triggerSharedOrServiceWorkerUpload(sharedWorkerRef.current);
    };

    window.addEventListener('pagehide', handlePageHide);
    return () => {
      window.removeEventListener('pagehide', handlePageHide);
    };
  }, [enabled, sessionId, releaseUploadThrottle]);

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
          // 업로드 성공 시 IndexedDB에서 제거
          removePendingUpload(message.payload.localSegmentId).catch(() => {});
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
    if (!enabled || !sessionId) return;

    return () => {
      releaseUploadThrottle();
      triggerSharedOrServiceWorkerUpload(sharedWorkerRef.current);
    };
  }, [enabled, sessionId, releaseUploadThrottle]);

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

      const currentSequence = sequenceRef.current;
      const resolvedContentType = contentType || blob.type || 'video/webm';

      // IndexedDB에 pending 업로드 저장 (SW용)
      addPendingUpload({
        segmentId: segment.segment_id,
        sessionId,
        sequence: currentSequence,
        videoStartMs: segment.start_media_time,
        videoEndMs: segment.end_media_time,
        contentType: resolvedContentType,
        logs,
        createdAt: new Date().toISOString(),
      }).catch(() => {});

      const payload: UploadWorkerSegmentPayload = {
        sessionId,
        sequence: currentSequence,
        segment,
        contentType: resolvedContentType,
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

    // Service Worker에도 알림
    triggerBackgroundSync().catch(() => {});
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
