/**
 * WebRTC 스트리밍 연결 훅
 *
 * AWS GameLift Streams Web SDK를 사용한 WebRTC 스트리밍 연결을 관리합니다.
 * useInputLogger 통합으로 입력 로그 수집 및 업로드 지원.
 */
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { useToast } from '@/hooks/useToast';

import {
  UPLOAD_RATE_CAP_BPS,
  UPLOAD_RATE_FALLBACK_BPS,
  UPLOAD_RATE_RATIO,
} from '../../constants';
import type { InputLog, SegmentMeta } from '../../types';
import { useInputLogger } from '../input/useInputLogger';
import { useInputLogUploader } from '../input/useInputLogUploader';
import { useUploadWorker } from '../upload/useUploadWorker';
import type {
  UseGameStreamOptions,
  UseGameStreamReturn,
} from './use-game-stream.types';
import { useSegmentRecorder } from './useSegmentRecorder';
import { useStreamConnection } from './useStreamConnection';
import { useStreamHealth } from './useStreamHealth';

export type {
  InputLoggingOptions,
  SegmentRecordingOptions,
  UseGameStreamOptions,
  UseGameStreamReturn,
} from './use-game-stream.types';

/**
 * WebRTC 스트리밍 연결
 */
export function useGameStream(
  options: UseGameStreamOptions
): UseGameStreamReturn {
  const {
    surveyUuid,
    onConnected,
    onDisconnected,
    onError,
    inputLogging = {},
    streamHealth: streamHealthOptions = {},
    segmentRecording = {},
  } = options;

  const {
    enabled: inputLoggingEnabled = true,
    batchSize = 50,
    onLogBatch,
  } = inputLogging;

  const {
    enabled: streamHealthEnabled = true,
    intervalMs: streamHealthIntervalMs,
    onStatusChange: onStreamHealthChange,
  } = streamHealthOptions;

  const highlightEnabled = import.meta.env.VITE_ENABLE_HIGHLIGHT === 'true';
  const {
    enabled: segmentRecordingEnabled = highlightEnabled,
    maxStorageBytes: segmentRecordingMaxStorageBytes,
    timesliceMs: segmentRecordingTimesliceMs,
    onSegmentStored: onSegmentStoredCallback,
    onError: onSegmentError,
  } = segmentRecording;

  const { toast } = useToast();

  // Mock 스트림 사용 여부
  const useMockStream =
    import.meta.env.DEV && import.meta.env.VITE_MOCK_STREAM === 'true';

  const [isGameReady, setIsGameReady] = useState(false);
  const [uploadSessionId, setUploadSessionId] = useState<string | null>(null);
  const handleConnected = useCallback(
    (uuid: string) => {
      setUploadSessionId(uuid);
      onConnected?.(uuid);
    },
    [onConnected]
  );
  const handleDisconnected = useCallback(() => {
    onDisconnected?.();
  }, [onDisconnected]);

  const {
    videoRef,
    audioRef,
    clientRef,
    isConnecting,
    isConnected,
    sessionUuid,
    connect: connectStream,
    disconnect: disconnectStream,
  } = useStreamConnection({
    surveyUuid,
    onConnected: handleConnected,
    onDisconnected: handleDisconnected,
    onError,
  });

  const getVideoRTCStats = useCallback(
    () => clientRef.current?.getVideoRTCStats() ?? Promise.resolve(null),
    [clientRef]
  );
  const getInputRTCStats = useCallback(
    () => clientRef.current?.getInputRTCStats() ?? Promise.resolve(null),
    [clientRef]
  );

  const streamHealth = useStreamHealth({
    enabled: streamHealthEnabled && isConnected,
    intervalMs: streamHealthIntervalMs,
    onStatusChange: onStreamHealthChange,
    getVideoRTCStats,
    getInputRTCStats,
  });

  const uploadWorkerEnabled = highlightEnabled && segmentRecordingEnabled;
  const uploadRateBps = useMemo(() => {
    if (!isConnected) {
      return null;
    }
    if (streamHealth.health === 'UNSTABLE') {
      return 0;
    }
    const availableIncomingBitrate =
      streamHealth.metrics.availableIncomingBitrate;
    if (
      typeof availableIncomingBitrate === 'number' &&
      Number.isFinite(availableIncomingBitrate) &&
      availableIncomingBitrate > 0
    ) {
      const computedRate = Math.floor(
        availableIncomingBitrate * UPLOAD_RATE_RATIO
      );
      return Math.min(UPLOAD_RATE_CAP_BPS, Math.max(0, computedRate));
    }
    return UPLOAD_RATE_FALLBACK_BPS;
  }, [
    isConnected,
    streamHealth.health,
    streamHealth.metrics.availableIncomingBitrate,
  ]);
  const { enqueueSegment: enqueueUploadSegment, flush: flushUploadWorker } =
    useUploadWorker({
      enabled: uploadWorkerEnabled,
      sessionId: uploadSessionId,
      streamHealth: streamHealth.health,
      uploadRateBps,
      streamingActive: isConnected,
      onError: (error) => {
        toast({
          title: '[UploadWorker] 업로드 처리 실패',
          variant: 'destructive',
          description: error.message,
        });
      },
      onSegmentFailed: (segmentId) => {
        toast({
          title: '[UploadWorker] 세그먼트 업로드 실패',
          variant: 'destructive',
          description: `segmentId=${segmentId}`,
        });
      },
    });

  const drainLogsBySegmentRef = useRef<(segmentId: string) => InputLog[]>(() => []);

  const handleSegmentStored = useCallback(
    (meta: SegmentMeta, blob?: Blob) => {
      onSegmentStoredCallback?.(meta, blob);

      if (!uploadWorkerEnabled || !blob) return;
      const logs = drainLogsBySegmentRef.current(meta.segment_id);
      enqueueUploadSegment(meta, blob, logs);
    },
    [onSegmentStoredCallback, uploadWorkerEnabled, enqueueUploadSegment]
  );

  const segmentRecorder = useSegmentRecorder({
    videoRef,
    sessionId: segmentRecordingEnabled ? sessionUuid : null,
    enabled: segmentRecordingEnabled && isConnected && isGameReady,
    maxStorageBytes: segmentRecordingMaxStorageBytes,
    timesliceMs: segmentRecordingTimesliceMs,
    onSegmentStored: handleSegmentStored,
    onError: onSegmentError,
  });

  // 입력 로그 수집 훅
  // 로딩 화면이 끝난 후(isGameReady=true)부터 입력 로깅 시작
  // Mock 환경에서는 SDK 필터가 작동하지 않으므로 DOM 리스너 직접 사용
  const {
    clearLogs,
    getLogsBySegment,
    getSegmentIdsWithLogs,
    clearLogsBySegment,
    drainLogsBySegment,
    createKeyboardFilter,
    createMouseFilter,
    createGamepadFilter,
  } = useInputLogger({
    videoElement: videoRef,
    sessionId: sessionUuid || surveyUuid,
    enabled: inputLoggingEnabled && isGameReady, // 로딩 완료 후부터 수집 시작
    batchSize,
    onLogBatch,
    useDomListeners: useMockStream, // Mock 환경에서는 DOM 리스너 사용
    resolveSegmentIds: segmentRecordingEnabled
      ? segmentRecorder.getActiveSegmentIds
      : undefined,
  });

  useEffect(() => {
    drainLogsBySegmentRef.current = drainLogsBySegment;
  }, [drainLogsBySegment]);

  // 입력 필터 생성 (memoized)
  const keyboardFilter = useCallback(
    (event: KeyboardEvent) => createKeyboardFilter()(event),
    [createKeyboardFilter]
  );
  const mouseFilter = useCallback(
    (event: MouseEvent) => createMouseFilter()(event),
    [createMouseFilter]
  );
  const gamepadFilter = useCallback(
    (gamepad: Gamepad) => createGamepadFilter()(gamepad),
    [createGamepadFilter]
  );

  // 입력 로그 업로드 훅
  // getVideoUrlBySegment는 Phase 4 (Upload Worker) 구현 시 실제 로직으로 대체 예정
  const { uploadInputLogs, flushLogs } = useInputLogUploader({
    sessionUuid,
    getSegmentIdsWithLogs,
    getLogsBySegment,
    getVideoUrlBySegment: useCallback(
      // TODO: Phase 4에서 SegmentStore에서 실제 S3 URL 조회 로직 구현
      (_segmentId: string) => null,
      []
    ),
    clearLogsBySegment,
    onUploadError: (error) => {
      toast({
        title: '[useGameStream] 입력 로그 업로드 실패:',
        variant: 'destructive',
        description: error.message,
      });
    },
  });

  const flushUploadQueue = useCallback(() => {
    if (uploadWorkerEnabled) {
      flushUploadWorker();
      return Promise.resolve();
    }
    return uploadInputLogs();
  }, [uploadWorkerEnabled, flushUploadWorker, uploadInputLogs]);

  const connect = useCallback(() => {
    return connectStream({
      inputFilters: inputLoggingEnabled
        ? {
            keyboardFilter,
            mouseFilter,
            gamepadFilter,
          }
        : undefined,
    });
  }, [
    connectStream,
    inputLoggingEnabled,
    keyboardFilter,
    mouseFilter,
    gamepadFilter,
  ]);

  const disconnect = useCallback(() => {
    if (uploadWorkerEnabled) {
      flushUploadWorker();
    } else {
      flushLogs(sessionUuid);
    }
    disconnectStream();
    setIsGameReady(false);
    clearLogs();
  }, [
    uploadWorkerEnabled,
    flushUploadWorker,
    flushLogs,
    sessionUuid,
    disconnectStream,
    clearLogs,
  ]);

  return {
    videoRef,
    audioRef,
    isConnecting,
    isConnected,
    isGameReady,
    setGameReady: setIsGameReady,
    sessionUuid,
    connect,
    disconnect,
    uploadInputLogs: flushUploadQueue,
    streamHealth,
  };
}
