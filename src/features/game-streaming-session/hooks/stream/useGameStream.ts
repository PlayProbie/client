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

const highlightEnabled = true;
// const highlightEnabled = import.meta.env.VITE_ENABLE_HIGHLIGHT === 'true';

// Mock 스트림 사용 여부
const useMockStream =
  import.meta.env.DEV && import.meta.env.VITE_MOCK_STREAM === 'true';

/**
 * WebRTC 스트리밍 연결
 */
export function useGameStream({
  surveyUuid,
  onConnected,
  onDisconnected,
  onError,
  inputLogging = {},
  streamHealth: streamHealthOptions = {},
  segmentRecording = {},
}: UseGameStreamOptions): UseGameStreamReturn {
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

  const {
    enabled: segmentRecordingEnabled = highlightEnabled,
    maxStorageBytes: segmentRecordingMaxStorageBytes,
    timesliceMs: segmentRecordingTimesliceMs,
    onSegmentStored: onSegmentStoredCallback,
    onError: onSegmentError,
  } = segmentRecording;

  const { toast } = useToast();

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

  const drainLogsBySegmentRef = useRef<(segmentId: string) => InputLog[]>(
    () => []
  );

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

  // 입력 필터 Ref 업데이트 (Stale Closure 방지)
  const createKeyboardFilterRef = useRef(createKeyboardFilter);
  const createMouseFilterRef = useRef(createMouseFilter);
  const createGamepadFilterRef = useRef(createGamepadFilter);

  useEffect(() => {
    createKeyboardFilterRef.current = createKeyboardFilter;
    createMouseFilterRef.current = createMouseFilter;
    createGamepadFilterRef.current = createGamepadFilter;
  }, [createKeyboardFilter, createMouseFilter, createGamepadFilter]);

  // 입력 필터 생성 (Stable Handler)
  // StreamClient에 전달되는 함수는 불변성을 유지하되, 내부에서 최신 Ref를 참조
  const keyboardFilter = useCallback(
    (event: KeyboardEvent) => createKeyboardFilterRef.current()(event),
    []
  );
  const mouseFilter = useCallback(
    (event: MouseEvent) => createMouseFilterRef.current()(event),
    []
  );
  const gamepadFilter = useCallback(
    (gamepad: Gamepad) => createGamepadFilterRef.current()(gamepad),
    []
  );

  const flushUploadQueue = useCallback(async () => {
    // 마지막 세그먼트가 완료되기를 기다림
    await segmentRecorder.finalizeRecording();

    if (uploadWorkerEnabled) {
      flushUploadWorker();
      return;
    }
    return;
  }, [segmentRecorder, uploadWorkerEnabled, flushUploadWorker]);

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

  const disconnect = useCallback(async () => {
    // 1. 마지막 세그먼트 완료 대기
    await segmentRecorder.finalizeRecording();

    // 2. 업로드 큐 플러시
    if (uploadWorkerEnabled) {
      flushUploadWorker();
    }

    // 3. 정리
    disconnectStream();
    setIsGameReady(false);
    clearLogs();
    // 세그먼트 정리는 인터뷰 완료 시 useChatSession에서 수행
  }, [
    segmentRecorder,
    uploadWorkerEnabled,
    flushUploadWorker,
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
