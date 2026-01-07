/**
 * WebRTC 스트리밍 연결 훅
 *
 * GameLift Streams와 호환되는 WebRTC 스트리밍 연결을 관리합니다.
 */
import { useCallback, useRef, useState } from 'react';

import { postSignal } from '../api';
import {
  createStreamClient,
  type StreamClient,
  type StreamInputEvent,
} from '../lib';

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
}

/** useGameStream 반환 타입 */
export interface UseGameStreamReturn {
  /** Video element ref (이 ref를 video 태그에 연결) */
  videoRef: React.RefObject<HTMLVideoElement | null>;
  /** 연결 중 상태 */
  isConnecting: boolean;
  /** 연결됨 상태 */
  isConnected: boolean;
  /** 현재 세션 UUID */
  sessionUuid: string | null;
  /** 스트리밍 연결 시작 */
  connect: () => Promise<void>;
  /** 스트리밍 연결 해제 */
  disconnect: () => void;
  /** 입력 이벤트 전송 */
  sendInput: (event: StreamInputEvent) => void;
}

/**
 * WebRTC 스트리밍 연결 훅
 *
 * @example
 * ```tsx
 * const { videoRef, connect, disconnect, isConnected } = useGameStream({
 *   surveyUuid,
 *   onConnected: (sessionUuid) => console.log('Connected:', sessionUuid),
 *   onError: (error) => console.error('Error:', error),
 * });
 *
 * return (
 *   <>
 *     <video ref={videoRef} autoPlay playsInline />
 *     <button onClick={connect}>Connect</button>
 *   </>
 * );
 * ```
 */
export function useGameStream(
  options: UseGameStreamOptions
): UseGameStreamReturn {
  const { surveyUuid, onConnected, onDisconnected, onError } = options;

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const clientRef = useRef<StreamClient | null>(null);

  const [isConnecting, setIsConnecting] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [sessionUuid, setSessionUuid] = useState<string | null>(null);

  const connect = useCallback(async () => {
    if (isConnecting || isConnected) return;

    setIsConnecting(true);

    try {
      // 1. StreamClient 생성
      const client = createStreamClient(videoRef.current);
      clientRef.current = client;

      // 2. WebRTC Offer 생성 (Base64 SignalRequest)
      const signalRequest = await client.generateSignalRequest();

      // 3. Backend로 Signal 전송 및 Response 수신
      const response = await postSignal(surveyUuid, { signalRequest });

      // 4. SignalResponse로 연결 완료
      await client.processSignalResponse(response.signalResponse);

      // 5. 상태 업데이트
      setSessionUuid(response.surveySessionUuid);
      setIsConnected(true);
      setIsConnecting(false);

      onConnected?.(response.surveySessionUuid);
    } catch (error) {
      setIsConnecting(false);
      setIsConnected(false);
      setSessionUuid(null);

      const err = error instanceof Error ? error : new Error(String(error));
      onError?.(err);
    }
  }, [surveyUuid, isConnecting, isConnected, onConnected, onError]);

  const disconnect = useCallback(() => {
    if (clientRef.current) {
      clientRef.current.disconnect();
      clientRef.current = null;
    }

    setIsConnected(false);
    setSessionUuid(null);
    onDisconnected?.();
  }, [onDisconnected]);

  const sendInput = useCallback((event: StreamInputEvent) => {
    if (clientRef.current && clientRef.current.isConnected()) {
      clientRef.current.sendInput(event);
    }
  }, []);

  return {
    videoRef,
    isConnecting,
    isConnected,
    sessionUuid,
    connect,
    disconnect,
    sendInput,
  };
}
