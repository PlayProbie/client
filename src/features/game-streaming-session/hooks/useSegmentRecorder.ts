import { useCallback, useEffect, useRef, useState } from 'react';

import { SegmentRecorder } from '../lib/segment-recorder/index';
import {
  createSegmentStore,
  type SegmentStore,
  type SegmentStoreBackend,
  type SegmentWriter,
} from '../lib/segment-store/index';
import type { SegmentMeta } from '../types/highlight';

export interface UseSegmentRecorderOptions {
  videoRef: React.RefObject<HTMLVideoElement | null>;
  sessionId: string | null;
  enabled: boolean;
  maxStorageBytes?: number;
  timesliceMs?: number;
  onSegmentStored?: (meta: SegmentMeta) => void;
  onError?: (error: Error) => void;
}

export interface UseSegmentRecorderReturn {
  isRecording: boolean;
  backend: SegmentStoreBackend | null;
  getActiveSegmentIds: (mediaTimeMs: number) => string[];
}

export function useSegmentRecorder(
  options: UseSegmentRecorderOptions
): UseSegmentRecorderReturn {
  const {
    videoRef,
    sessionId,
    enabled,
    maxStorageBytes,
    timesliceMs,
    onSegmentStored,
    onError,
  } = options;

  const recorderRef = useRef<SegmentRecorder | null>(null);
  const storeRef = useRef<SegmentStore | null>(null);

  const [backend, setBackend] = useState<SegmentStoreBackend | null>(null);
  const [isRecording, setIsRecording] = useState(false);

  const getActiveSegmentIds = useCallback((mediaTimeMs: number) => {
    return recorderRef.current?.getActiveSegmentIds(mediaTimeMs) ?? [];
  }, []);

  useEffect(() => {
    if (!enabled || !sessionId) {
      return;
    }

    const videoElement = videoRef.current;
    if (!videoElement) {
      return;
    }

    let cancelled = false;

    const startRecorder = async () => {
      const store = await createSegmentStore({
        sessionId,
        maxStorageBytes,
      });
      if (cancelled) return;

      storeRef.current = store;
      setBackend(store.backend);

      const writers = new Map<string, SegmentWriter>();

      const recorder = new SegmentRecorder({
        videoElement,
        sessionId,
        timesliceMs,
        onSegmentStart: async (segment) => {
          if (store.backend !== 'opfs') return;

          try {
            const writer = await store.openSegmentWriter(segment.segmentId);
            if (writer) {
              writers.set(segment.segmentId, writer);
            }
          } catch (error) {
            const err =
              error instanceof Error ? error : new Error(String(error));
            onError?.(err);
          }
        },
        onSegmentChunk: (segmentId, chunk) => {
          const writer = writers.get(segmentId);
          if (!writer) return;
          void writer.write(chunk).catch((error) => {
            const err =
              error instanceof Error ? error : new Error(String(error));
            onError?.(err);
          });
        },
        onSegmentReady: async (segment) => {
          const writer = writers.get(segment.segmentId);
          try {
            if (writer) {
              await writer.close();
              await store.saveSegmentMeta(segment.meta, writer.getSize());
              writers.delete(segment.segmentId);
            } else {
              await store.saveSegment(segment.meta, segment.blob);
            }
            onSegmentStored?.(segment.meta);
          } catch (error) {
            const err =
              error instanceof Error ? error : new Error(String(error));
            onError?.(err);
          }
        },
        onError: (error) => {
          onError?.(error);
        },
      });

      recorderRef.current = recorder;
      await recorder.start();

      if (!cancelled) {
        setIsRecording(true);
      }
    };

    startRecorder().catch((error) => {
      onError?.(error instanceof Error ? error : new Error(String(error)));
    });

    return () => {
      cancelled = true;
      recorderRef.current?.stop();
      recorderRef.current = null;
      storeRef.current = null;
      setIsRecording(false);
    };
  }, [
    enabled,
    sessionId,
    videoRef,
    maxStorageBytes,
    timesliceMs,
    onSegmentStored,
    onError,
  ]);

  return {
    isRecording,
    backend,
    getActiveSegmentIds,
  };
}
