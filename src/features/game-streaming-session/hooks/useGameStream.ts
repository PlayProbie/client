/**
 * WebRTC 스트리밍 연결 훅
 *
 * AWS GameLift Streams Web SDK를 사용한 WebRTC 스트리밍 연결을 관리합니다.
 */
import { useCallback, useRef, useState } from 'react';

import { postSignal } from '../api';
import { createStreamClient, type StreamClient } from '../lib';

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
  /** Audio element ref (이 ref를 audio 태그에 연결) */
  audioRef: React.RefObject<HTMLAudioElement | null>;
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
}

/**
 * WebRTC 스트리밍 연결 훅
 *
 * @example
 * ```tsx
 * const { videoRef, audioRef, connect, disconnect, isConnected } = useGameStream({
 *   surveyUuid,
 *   onConnected: (sessionUuid) => console.log('Connected:', sessionUuid),
 *   onError: (error) => console.error('Error:', error),
 * });
 *
 * return (
 *   <>
 *     <video ref={videoRef} autoPlay playsInline />
 *     <audio ref={audioRef} autoPlay />
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
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const clientRef = useRef<StreamClient | null>(null);

  const [isConnecting, setIsConnecting] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [sessionUuid, setSessionUuid] = useState<string | null>(null);

  const connect = useCallback(async () => {
    if (isConnecting || isConnected) return;

    setIsConnecting(true);

    try {
      // 1. StreamClient 생성 (GameLift Streams SDK 사용)

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
  ]);

  const disconnect = useCallback(() => {
    if (clientRef.current) {
      clientRef.current.detachInput();
      clientRef.current.disconnect();
      clientRef.current = null;
    }

    setIsConnected(false);
    onDisconnected?.();
  }, [onDisconnected]);

  return {
    videoRef,
    audioRef,
    isConnecting,
    isConnected,
    sessionUuid,
    connect,
    disconnect,
  };
}
