import { useCallback, useEffect, useRef } from 'react';

import { postInputLogs } from '../api';
import type { InputLog } from '../types/highlight';

export interface UseInputLogUploaderOptions {
  sessionUuid: string | null;
  getSegmentIdsWithLogs: () => string[];
  getLogsBySegment: (segmentId: string) => InputLog[];
  clearLogsBySegment: (segmentId: string) => void;
  onUploadError?: (error: Error) => void;
}

export interface UseInputLogUploaderReturn {
  uploadInputLogs: () => Promise<void>;
  flushLogs: (sessionId: string | null) => void;
}

export function useInputLogUploader(
  options: UseInputLogUploaderOptions
): UseInputLogUploaderReturn {
  const {
    sessionUuid,
    getSegmentIdsWithLogs,
    getLogsBySegment,
    clearLogsBySegment,
    onUploadError,
  } = options;

  const sessionUuidRef = useRef(sessionUuid);
  useEffect(() => {
    sessionUuidRef.current = sessionUuid;
  }, [sessionUuid]);

  const uploadInputLogs = useCallback(async () => {
    if (!sessionUuid) return;

    const segmentIds = getSegmentIdsWithLogs();
    if (segmentIds.length === 0) return;

    let lastError: Error | null = null;
    for (const segmentId of segmentIds) {
      const logs = getLogsBySegment(segmentId);
      if (logs.length === 0) continue;

      try {
        const result = await postInputLogs(sessionUuid, segmentId, logs);
        if (result.success) {
          clearLogsBySegment(segmentId);
        }
      } catch (error: unknown) {
        lastError = error instanceof Error ? error : new Error(String(error));
      }
    }

    if (lastError) {
      onUploadError?.(lastError);
    }
  }, [
    sessionUuid,
    getSegmentIdsWithLogs,
    getLogsBySegment,
    clearLogsBySegment,
    onUploadError,
  ]);

  const flushLogs = useCallback(
    (sessionId: string | null) => {
      if (!sessionId) return;

      const segmentIds = getSegmentIdsWithLogs();
      if (segmentIds.length === 0) return;

      segmentIds.forEach((segmentId) => {
        const logs = getLogsBySegment(segmentId);
        if (logs.length === 0) return;

        postInputLogs(sessionId, segmentId, logs).catch(() => {
          // 무시 (best-effort)
        });
      });
    },
    [getSegmentIdsWithLogs, getLogsBySegment]
  );

  useEffect(() => {
    return () => {
      flushLogs(sessionUuidRef.current);
    };
  }, [flushLogs]);

  return {
    uploadInputLogs,
    flushLogs,
  };
}
