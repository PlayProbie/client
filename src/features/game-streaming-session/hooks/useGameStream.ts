/**
 * WebRTC 스트리밍 연결 훅
 *
 * AWS GameLift Streams Web SDK를 사용한 WebRTC 스트리밍 연결을 관리합니다.
 * useInputLogger 통합으로 입력 로그 수집 및 업로드 지원.
 */
import { useCallback, useEffect, useRef, useState } from 'react';

import { useToast } from '@/hooks/useToast';

import { postInputLogs, postSignal } from '../api';
import { createStreamClient, type StreamClient } from '../lib';
import type { InputLog } from '../types/highlight';
import { useInputLogger } from './input-logger';

/** 입력 로깅 옵션 */
export interface InputLoggingOptions {
  /** 입력 로깅 활성화 여부 (기본값: true) */
  enabled?: boolean;
  /** 로그 배치 업로드 크기 (기본값: 50) */
  batchSize?: number;
  /** 로그 배치 콜백 (디버깅용) */
  onLogBatch?: (logs: InputLog[]) => void;
}

/** useGameStream 옵션 */
export interface UseGameStreamOptions {
  /** Survey UUID (필수) */
  surveyUuid: string;
  /** 연결 성공 시 콜백 */
  onConnected?: (sessionUuid: string) => void;
  /** 연결 해제 시 콜백 */
  onDisconnected?: () => void;
  /** 에러 발생 시 콜백 */
  onError?: (error: Error) => void;
  /** 입력 로깅 옵션 (Phase 1) */
  inputLogging?: InputLoggingOptions;
}

/** useGameStream 반환 타입 */
export interface UseGameStreamReturn {
  /** Video element ref (이 ref를 video 태그에 연결) */
  videoRef: React.RefObject<HTMLVideoElement | null>;
  /** Audio element ref (이 ref를 audio 태그에 연결) */
  audioRef: React.RefObject<HTMLAudioElement | null>;
  /** 연결 중 상태 */
  isConnecting: boolean;
  /** 연결됨 상태 */
  isConnected: boolean;
  /** 게임 준비 완료 상태 (로딩 화면 종료 후) */
  isGameReady: boolean;
  /** 게임 준비 상태 설정 (로딩 화면 종료 시 호출) */
  setGameReady: (ready: boolean) => void;
  /** 현재 세션 UUID */
  sessionUuid: string | null;
  /** 스트리밍 연결 시작 */
  connect: () => Promise<void>;
  /** 스트리밍 연결 해제 */
  disconnect: () => void;

  /** 입력 로그 수동 업로드 */
  uploadInputLogs: () => Promise<void>;
}

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
  } = options;

  const {
    enabled: inputLoggingEnabled = true,
    batchSize = 50,
    onLogBatch,
  } = inputLogging;

  const { toast } = useToast();

  // Mock 스트림 사용 여부
  const useMockStream =
    import.meta.env.DEV && import.meta.env.VITE_MOCK_STREAM === 'true';

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const clientRef = useRef<StreamClient | null>(null);

  const [isConnecting, setIsConnecting] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [isGameReady, setIsGameReady] = useState(false);
  const [sessionUuid, setSessionUuid] = useState<string | null>(null);

  // 입력 로그 수집 훅
  // 로딩 화면이 끝난 후(isGameReady=true)부터 입력 로깅 시작
  // Mock 환경에서는 SDK 필터가 작동하지 않으므로 DOM 리스너 직접 사용
  const {
    getLogs,
    clearLogs,
    currentSegmentId,
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
  });

  // cleanup용 ref (최신 값 추적)
  const sessionUuidRef = useRef(sessionUuid);
  const currentSegmentIdRef = useRef(currentSegmentId);
  useEffect(() => {
    sessionUuidRef.current = sessionUuid;
    currentSegmentIdRef.current = currentSegmentId;
  }, [sessionUuid, currentSegmentId]);

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

  // 입력 로그 업로드 함수
  const uploadInputLogs = useCallback(async () => {
    const logs = getLogs();
    if (!sessionUuid || logs.length === 0) return;

    try {
      const result = await postInputLogs(sessionUuid, currentSegmentId, logs);
      if (result.success) {
        clearLogs();
      }
    } catch (error: unknown) {
      toast({
        title: '[useGameStream] 입력 로그 업로드 실패:',
        variant: 'destructive',
        description: (error as Error).message,
      });
    }
  }, [getLogs, sessionUuid, currentSegmentId, clearLogs, toast]);

  // 연결 해제 시 남은 로그 업로드
  useEffect(() => {
    return () => {
      const logs = getLogs();
      const sid = sessionUuidRef.current;
      const segId = currentSegmentIdRef.current;
      if (logs.length > 0 && sid) {
        postInputLogs(sid, segId, logs).catch(() => {
          // 무시 (best-effort)
        });
      }
    };
  }, [getLogs]);

  const connect = useCallback(async () => {
    if (isConnecting || isConnected) return;

    setIsConnecting(true);

    try {
      // 1. StreamClient 생성 (GameLift Streams SDK 사용)
      // 입력 필터 연결
      const client = createStreamClient(videoRef.current, audioRef.current, {
        onConnectionStateChange: (state) => {
          if (state === 'connected') {
            setIsConnected(true);
          } else if (state === 'disconnected' || state === 'failed') {
            setIsConnected(false);
          }
        },
        onServerDisconnect: () => {
          setIsConnected(false);
          setSessionUuid(null);
          onDisconnected?.();
        },
        onError: (error) => {
          onError?.(error);
        },
        // 입력 필터 연결 (입력 로그 수집용)
        inputFilters: inputLoggingEnabled
          ? {
              keyboardFilter,
              mouseFilter,
              gamepadFilter,
            }
          : undefined,
      });
      clientRef.current = client;

      // 2. SignalRequest 생성 (SDK가 WebRTC SDP offer 생성)
      const signalRequest = await client.generateSignalRequest();

      // 3. Backend로 Signal 전송 및 Response 수신
      const response = await postSignal(surveyUuid, { signalRequest });

      // 4. SignalResponse로 연결 완료
      await client.processSignalResponse(response.signalResponse);

      // 5. 입력 활성화
      client.attachInput();

      // 6. 상태 업데이트
      setSessionUuid(response.surveySessionUuid);
      setIsConnected(true);
      setIsConnecting(false);

      onConnected?.(response.surveySessionUuid);
    } catch (error) {
      setIsConnecting(false);
      setIsConnected(false);
      setSessionUuid(null);

      // 클라이언트 정리
      if (clientRef.current) {
        clientRef.current.disconnect();
        clientRef.current = null;
      }

      const err = error instanceof Error ? error : new Error(String(error));
      onError?.(err);
    }
  }, [
    surveyUuid,
    isConnecting,
    isConnected,
    onConnected,
    onDisconnected,
    onError,
    inputLoggingEnabled,
    keyboardFilter,
    mouseFilter,
    gamepadFilter,
  ]);

  const disconnect = useCallback(() => {
    // 연결 해제 전 로그 업로드
    const logs = getLogs();
    if (logs.length > 0 && sessionUuid) {
      postInputLogs(sessionUuid, currentSegmentId, logs).catch(() => {
        // 무시 (best-effort)
      });
    }

    if (clientRef.current) {
      clientRef.current.detachInput();
      clientRef.current.disconnect();
      clientRef.current = null;
    }

    setIsConnected(false);
    setIsGameReady(false); // 게임 준비 상태 초기화
    clearLogs();
    onDisconnected?.();
  }, [onDisconnected, getLogs, sessionUuid, currentSegmentId, clearLogs]);

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
    uploadInputLogs,
  };
}
