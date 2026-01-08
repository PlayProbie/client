/**
 * WebRTC Streaming Client
 *
 * Amazon GameLift Streams Web SDK를 사용한 스트리밍 클라이언트입니다.
 * generateSignalRequest() / processSignalResponse() 패턴을 따릅니다.
 */

// GameLift Streams SDK - 타입 임포트 (.d.ts)
import type {
  GameLiftStreams as GameLiftStreamsType,
  GameLiftStreamsArgs,
  IClientConnection,
} from '@/lib/gameliftstreams-1.1.0.d';
// GameLift Streams SDK - 런타임 임포트 (.mjs)
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore - ESM 파일 직접 임포트
import { GameLiftStreams } from '@/lib/gameliftstreams-1.1.0.mjs';

import { cleanupMockStream, createMockMediaStream } from './mock-stream';

/**
 * Mock 스트림 사용 여부
 * 개발 환경에서 VITE_MOCK_STREAM=true 설정 시 활성화
 */
const USE_MOCK_STREAM =
  import.meta.env.DEV && import.meta.env.VITE_MOCK_STREAM === 'true';

/** WebRTC 클라이언트 설정 */
export interface StreamClientConfig {
  /** Mock 스트림 사용 여부 (개발 테스트용, 기본값: 환경변수) */
  useMockStream?: boolean;
  /** 연결 상태 변경 콜백 */
  onConnectionStateChange?: (state: string) => void;
  /** 서버 연결 해제 콜백 */
  onServerDisconnect?: (reason: string) => void;
  /** 에러 콜백 */
  onError?: (error: Error) => void;
}

/** WebRTC 스트림 클라이언트 인터페이스 */
export interface StreamClient {
  /** WebRTC Offer를 생성하고 SignalRequest 반환 */
  generateSignalRequest(): Promise<string>;
  /** Backend에서 받은 SignalResponse를 처리하여 연결 완료 */
  processSignalResponse(signalResponse: string): Promise<void>;
  /** 연결 해제 및 리소스 정리 */
  disconnect(): void;
  /** 연결 상태 */
  isConnected(): boolean;
  /** 입력 활성화 */
  attachInput(): void;
  /** 입력 비활성화 */
  detachInput(): void;
}

/**
 * GameLift Streams SDK를 사용한 스트림 클라이언트 생성
 *
 * @param videoElement - 스트림을 표시할 video element
 * @param audioElement - 스트림 오디오를 재생할 audio element
 * @param config - 클라이언트 설정
 * @returns StreamClient 인스턴스
 *
 * @example
 * ```typescript
 * const client = createStreamClient(videoRef.current, audioRef.current);
 * const signalRequest = await client.generateSignalRequest();
 * // Backend로 signalRequest 전송 후 signalResponse 수신
 * await client.processSignalResponse(signalResponse);
 * // 이제 videoElement에 스트림이 표시됨
 * client.attachInput(); // 입력 활성화
 * ```
 */
export function createStreamClient(
  videoElement: HTMLVideoElement | null,
  audioElement: HTMLAudioElement | null,
  config: StreamClientConfig = {}
): StreamClient {
  const {
    useMockStream = USE_MOCK_STREAM,
    onConnectionStateChange,
    onServerDisconnect,
    onError,
  } = config;

  let gameLiftClient: GameLiftStreamsType | null = null;
  let mockMediaStream: MediaStream | null = null;
  let connected = false;

  // Mock 스트림 클라이언트 생성 (개발용)
  if (useMockStream) {
    return createMockStreamClient(videoElement, config);
  }

  // video, audio element 필수 확인
  if (!videoElement) {
    throw new Error('videoElement is required for GameLift Streams');
  }
  if (!audioElement) {
    throw new Error('audioElement is required for GameLift Streams');
  }

  // 연결 콜백 설정
  const clientConnection: IClientConnection = {
    connectionState: (state: string) => {
      connected = state === 'connected';
      onConnectionStateChange?.(state);
    },
    serverDisconnect: (reasonCode: string) => {
      connected = false;
      onServerDisconnect?.(reasonCode);
    },
    channelError: (error: Error) => {
      onError?.(error instanceof Error ? error : new Error(String(error)));
    },
  };

  // GameLift Streams 클라이언트 생성
  const args: GameLiftStreamsArgs = {
    videoElement,
    audioElement,
    clientConnection,
    inputConfiguration: {
      autoKeyboard: true,
      autoMouse: true,
      autoGamepad: true,
      setCursor: true,
      autoPointerLock: 'fullscreen',
    },
    streamConfiguration: {
      enableAudio: true,
      maximumResolution: '1080p',
    },
  };

  gameLiftClient = new GameLiftStreams(args);

  return {
    async generateSignalRequest(): Promise<string> {
      if (!gameLiftClient) {
        throw new Error('GameLift Streams client not initialized');
      }

      const signalRequest = await gameLiftClient.generateSignalRequest();

      return signalRequest;
    },

    async processSignalResponse(signalResponse: string): Promise<void> {
      if (!gameLiftClient) {
        throw new Error('GameLift Streams client not initialized');
      }

      await gameLiftClient.processSignalResponse(signalResponse);
      connected = true;
    },

    disconnect(): void {
      if (gameLiftClient) {
        gameLiftClient.close();
        gameLiftClient = null;
      }
      if (mockMediaStream) {
        cleanupMockStream(mockMediaStream);
        mockMediaStream = null;
      }
      connected = false;
    },

    isConnected(): boolean {
      return connected;
    },

    attachInput(): void {
      gameLiftClient?.attachInput();
    },

    detachInput(): void {
      gameLiftClient?.detachInput();
    },
  };
}

/**
 * Mock 스트림 클라이언트 (개발 테스트용)
 */
function createMockStreamClient(
  videoElement: HTMLVideoElement | null,
  config: StreamClientConfig
): StreamClient {
  let mockMediaStream: MediaStream | null = null;
  let connected = false;

  return {
    async generateSignalRequest(): Promise<string> {
      // Mock: 단순 테스트 문자열 반환
      return JSON.stringify({
        type: 'offer',
        sdp: 'mock-sdp-offer',
        webSdkVersion: '1.1.0',
      });
    },

    async processSignalResponse(_signalResponse: string): Promise<void> {
      mockMediaStream = createMockMediaStream({
        width: 1280,
        height: 720,
        frameRate: 30,
      });

      if (videoElement) {
        videoElement.srcObject = mockMediaStream;
      }

      connected = true;
      config.onConnectionStateChange?.('connected');
    },

    disconnect(): void {
      if (mockMediaStream) {
        cleanupMockStream(mockMediaStream);
        mockMediaStream = null;
      }
      if (videoElement) {
        videoElement.srcObject = null;
      }
      connected = false;
    },

    isConnected(): boolean {
      return connected;
    },

    attachInput(): void {
      // Mock: no-op
    },

    detachInput(): void {
      // Mock: no-op
    },
  };
}

// Re-export types for external use
export type { GameLiftStreamsArgs, IClientConnection };
