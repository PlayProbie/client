/**
 * Upload Worker Hook
 *
 * 세그먼트 업로드를 관리하는 오케스트레이션 훅.
 * Web Worker, Shared Worker, Service Worker를 조합하여 안정적인 업로드를 보장합니다.
 */
import { useCallback, useEffect, useRef } from 'react';

import { API_BASE_URL } from '@/constants/api';

import {
  registerServiceWorker,
  triggerSharedOrServiceWorkerUpload,
} from '../../lib/upload/service-worker-manager';
import {
  addSharedWorkerListener,
  getSharedWorker,
  type SharedWorkerMessage,
} from '../../lib/upload/shared-worker-manager';
import {
  addPendingUpload,
  removePendingUpload,
} from '../../lib/upload/upload-sync-store';
import type { InputLog, SegmentMeta } from '../../types';
import type {
  UploadWorkerCommand,
  UploadWorkerSegmentPayload,
} from '../../workers/upload-worker.types';
import type { StreamHealthState } from '../stream/useStreamHealth';
import { useWebWorker } from './useWebWorker';

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
  const sequenceRef = useRef(0);
  const swRegistrationRef = useRef<ServiceWorkerRegistration | null>(null);

  // Web Worker 관리 훅
  const { workerRef, releaseUploadThrottle } = useWebWorker({
    enabled,
    sessionId,
    streamHealth,
    uploadRateBps,
    streamingActive,
    onError,
    onSegmentUploaded,
    onSegmentFailed,
  });

  // 세션 변경 시 시퀀스 초기화
  useEffect(() => {
    sequenceRef.current = 0;
  }, [sessionId]);

  // Service Worker 및 Shared Worker 등록
  useEffect(() => {
    if (!enabled) return;

    // API URL 절대 경로 변환
    const apiUrl = API_BASE_URL.startsWith('/')
      ? `${window.location.origin}${API_BASE_URL}`
      : API_BASE_URL;
    registerServiceWorker(apiUrl).then((registration) => {
      swRegistrationRef.current = registration;
    });

    const sharedWorker = getSharedWorker();
    if (!sharedWorker) return;

    const unsubscribe = addSharedWorkerListener(
      (message: SharedWorkerMessage) => {
        if (
          message.type === 'SEGMENT_UPLOADED' &&
          message.payload?.localSegmentId
        ) {
          removePendingUpload(message.payload.localSegmentId).catch(() => {});
          if (
            message.payload.remoteSegmentId &&
            typeof message.payload.s3Url === 'string'
          ) {
            onSegmentUploaded?.(
              message.payload.localSegmentId,
              message.payload.remoteSegmentId,
              message.payload.s3Url
            );
          }
        } else if (
          message.type === 'SEGMENT_FAILED' &&
          message.payload?.localSegmentId
        ) {
          onSegmentFailed?.(
            message.payload.localSegmentId,
            message.payload.reason ?? ''
          );
        }
      }
    );

    return () => {
      unsubscribe();
    };
  }, [enabled, onSegmentUploaded, onSegmentFailed]);

  // pagehide 이벤트에서 Background Sync 트리거
  useEffect(() => {
    if (!enabled || !sessionId) return;

    const handlePageHide = () => {
      releaseUploadThrottle();
      triggerSharedOrServiceWorkerUpload();
    };

    window.addEventListener('pagehide', handlePageHide);
    return () => {
      window.removeEventListener('pagehide', handlePageHide);
    };
  }, [enabled, sessionId, releaseUploadThrottle]);

  // 컴포넌트 언마운트 시 업로드 트리거
  // (releaseUploadThrottle은 useWebWorker cleanup에서 자동 처리됨)
  useEffect(() => {
    if (!enabled || !sessionId) return;

    return () => {
      triggerSharedOrServiceWorkerUpload();
    };
  }, [enabled, sessionId]);

  const enqueueSegment = useCallback(
    (
      segment: SegmentMeta,
      blob: Blob,
      logs: InputLog[] = [],
      contentType?: string
    ) => {
      if (!sessionId) return;

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
        status: 'pending',
        processingOwner: null,
        processingStartedAt: null,
        updatedAt: new Date().toISOString(),
      }).catch(() => {});

      sequenceRef.current += 1;

      const worker = workerRef.current;
      if (worker) {
        const payload: UploadWorkerSegmentPayload = {
          sessionId,
          sequence: currentSequence,
          segment,
          contentType: resolvedContentType,
          blob,
          logs,
        };

        const message: UploadWorkerCommand = {
          type: 'enqueue-segment',
          payload,
        };

        worker.postMessage(message);
      } else {
        triggerSharedOrServiceWorkerUpload();
      }
    },
    [sessionId, workerRef]
  );

  const flush = useCallback(() => {
    const worker = workerRef.current;
    if (!worker) {
      triggerSharedOrServiceWorkerUpload();
      return;
    }

    const message: UploadWorkerCommand = { type: 'flush' };
    worker.postMessage(message);

    triggerSharedOrServiceWorkerUpload();
  }, [workerRef]);

  const reset = useCallback(() => {
    const worker = workerRef.current;
    if (!worker) return;

    const message: UploadWorkerCommand = { type: 'reset' };
    worker.postMessage(message);
  }, [workerRef]);

  return {
    enqueueSegment,
    flush,
    reset,
  };
}
