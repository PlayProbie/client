/**
 * WebRTC Streaming Client
 *
 * Amazon GameLift Streams SDK와 호환되는 WebRTC 클라이언트 래퍼입니다.
 * generateSignalRequest() / processSignalResponse() 패턴을 따릅니다.
 *
 * NOTE: 실제 GameLift SDK가 설치되면 이 파일을 SDK 호출로 교체하세요.
 */

/** WebRTC 클라이언트 설정 */
export interface StreamClientConfig {
  /** Video element에 스트림을 자동 연결할지 여부 */
  autoAttachVideo?: boolean;
  /** ICE 서버 설정 (STUN/TURN) */
  iceServers?: RTCIceServer[];
}

type KeyboardInputAction = 'down' | 'up';
type MouseInputAction = 'move' | 'down' | 'up';

export type StreamInputEvent =
  | {
      kind: 'keyboard';
      action: KeyboardInputAction;
      keyCode: number;
      altKey: boolean;
      ctrlKey: boolean;
      shiftKey: boolean;
      metaKey: boolean;
      repeat: boolean;
    }
  | {
      kind: 'mouse';
      action: MouseInputAction;
      x: number;
      y: number;
      button: number;
      buttons: number;
      movementX: number;
      movementY: number;
    };

/** WebRTC 스트림 클라이언트 인터페이스 */
export interface StreamClient {
  /** WebRTC Offer를 생성하고 Base64 인코딩된 SignalRequest 반환 */
  generateSignalRequest(): Promise<string>;
  /** Backend에서 받은 SignalResponse를 처리하여 연결 완료 */
  processSignalResponse(signalResponse: string): Promise<void>;
  /** 현재 미디어 스트림 반환 (연결 전에는 null) */
  getMediaStream(): MediaStream | null;
  /** 연결 해제 및 리소스 정리 */
  disconnect(): void;
  /** 연결 상태 */
  isConnected(): boolean;
  /** 입력 이벤트 전송 (SDK 입력 패킷) */
  sendInput(event: StreamInputEvent): void;
}

/** 기본 ICE 서버 설정 (Google STUN) */
const DEFAULT_ICE_SERVERS: RTCIceServer[] = [
  { urls: 'stun:stun.l.google.com:19302' },
  { urls: 'stun:stun1.l.google.com:19302' },
];

const INPUT_MESSAGE_TYPE = {
  keyboard: 1,
  mouse: 2,
} as const;

const KEYBOARD_ACTION = {
  down: 1,
  up: 2,
} as const;

const MOUSE_ACTION = {
  move: 1,
  down: 2,
  up: 3,
} as const;

const clampUint8 = (value: number) =>
  Math.min(255, Math.max(0, Math.round(value)));
const clampUint16 = (value: number) =>
  Math.min(65535, Math.max(0, Math.round(value)));
const clampInt16 = (value: number) =>
  Math.min(32767, Math.max(-32768, Math.round(value)));

const encodeKeyboardInput = (
  event: Extract<StreamInputEvent, { kind: 'keyboard' }>
): Uint8Array => {
  const buffer = new ArrayBuffer(8);
  const view = new DataView(buffer);
  const modifiers =
    (event.altKey ? 1 : 0) |
    (event.ctrlKey ? 2 : 0) |
    (event.shiftKey ? 4 : 0) |
    (event.metaKey ? 8 : 0);

  view.setUint8(0, INPUT_MESSAGE_TYPE.keyboard);
  view.setUint8(1, KEYBOARD_ACTION[event.action]);
  view.setUint8(2, modifiers);
  view.setUint8(3, event.repeat ? 1 : 0);
  view.setUint16(4, clampUint16(event.keyCode), true);
  view.setUint16(6, 0, true);

  return new Uint8Array(buffer);
};

const encodeMouseInput = (
  event: Extract<StreamInputEvent, { kind: 'mouse' }>
): Uint8Array => {
  const buffer = new ArrayBuffer(12);
  const view = new DataView(buffer);

  view.setUint8(0, INPUT_MESSAGE_TYPE.mouse);
  view.setUint8(1, MOUSE_ACTION[event.action]);
  view.setUint8(2, clampUint8(event.button));
  view.setUint8(3, clampUint8(event.buttons));
  view.setUint16(4, clampUint16(event.x), true);
  view.setUint16(6, clampUint16(event.y), true);
  view.setInt16(8, clampInt16(event.movementX), true);
  view.setInt16(10, clampInt16(event.movementY), true);

  return new Uint8Array(buffer);
};

const encodeInputEvent = (event: StreamInputEvent): Uint8Array => {
  if (event.kind === 'keyboard') {
    return encodeKeyboardInput(event);
  }
  return encodeMouseInput(event);
};

/**
 * WebRTC 스트림 클라이언트 생성
 *
 * @param videoElement - 스트림을 표시할 video element (optional)
 * @param config - 클라이언트 설정
 * @returns StreamClient 인스턴스
 *
 * @example
 * ```typescript
 * const client = createStreamClient(videoRef.current);
 * const signalRequest = await client.generateSignalRequest();
 * // Backend로 signalRequest 전송 후 signalResponse 수신
 * await client.processSignalResponse(signalResponse);
 * // 이제 videoElement에 스트림이 표시됨
 * ```
 */
export function createStreamClient(
  videoElement?: HTMLVideoElement | null,
  config: StreamClientConfig = {}
): StreamClient {
  const { autoAttachVideo = true, iceServers = DEFAULT_ICE_SERVERS } = config;

  let peerConnection: RTCPeerConnection | null = null;
  let mediaStream: MediaStream | null = null;
  let inputChannel: RTCDataChannel | null = null;
  let connected = false;

  const createPeerConnection = (): RTCPeerConnection => {
    const pc = new RTCPeerConnection({
      iceServers,
      iceCandidatePoolSize: 10,
    });

    // Remote 트랙 수신 시 처리
    pc.ontrack = (event) => {
      const [stream] = event.streams;
      if (stream) {
        mediaStream = stream;
        if (autoAttachVideo && videoElement) {
          videoElement.srcObject = stream;
        }
      }
    };

    // 연결 상태 변경 감지
    pc.onconnectionstatechange = () => {
      connected = pc.connectionState === 'connected';
      if (pc.connectionState === 'failed' || pc.connectionState === 'closed') {
        mediaStream = null;
        inputChannel = null;
      }
    };

    return pc;
  };

  return {
    async generateSignalRequest(): Promise<string> {
      // 기존 연결이 있으면 정리
      if (peerConnection) {
        peerConnection.close();
      }

      peerConnection = createPeerConnection();

      // Transceiver 추가 (video/audio 수신용)
      peerConnection.addTransceiver('video', { direction: 'recvonly' });
      peerConnection.addTransceiver('audio', { direction: 'recvonly' });

      // Data Channel 생성 (입력 전송용)
      inputChannel = peerConnection.createDataChannel('input', {
        ordered: true,
      });
      inputChannel.onopen = () => {
        // eslint-disable-next-line no-console
        console.log('Input Data Channel opened');
      };

      // SDP Offer 생성
      const offer = await peerConnection.createOffer();
      await peerConnection.setLocalDescription(offer);

      // ICE gathering 완료 대기
      await waitForIceGathering(peerConnection);

      // Local Description을 Base64로 인코딩
      const localDescription = peerConnection.localDescription;
      if (!localDescription) {
        throw new Error('Failed to create local description');
      }

      const signalRequest = btoa(JSON.stringify(localDescription));
      return signalRequest;
    },

    async processSignalResponse(signalResponse: string): Promise<void> {
      if (!peerConnection) {
        throw new Error(
          'No peer connection. Call generateSignalRequest first.'
        );
      }

      // Base64 디코딩 후 SDP Answer 파싱
      const answerJson = atob(signalResponse);
      const answer = JSON.parse(answerJson) as RTCSessionDescriptionInit;

      // Remote Description 설정으로 연결 완료
      await peerConnection.setRemoteDescription(answer);
    },

    getMediaStream(): MediaStream | null {
      return mediaStream;
    },

    disconnect(): void {
      if (inputChannel) {
        inputChannel.close();
        inputChannel = null;
      }
      if (peerConnection) {
        peerConnection.close();
        peerConnection = null;
      }
      if (videoElement) {
        videoElement.srcObject = null;
      }
      mediaStream = null;
      connected = false;
    },

    isConnected(): boolean {
      return connected;
    },

    /** 입력 이벤트 전송 (SDK 입력 패킷) */
    sendInput(event: StreamInputEvent): void {
      if (inputChannel && inputChannel.readyState === 'open') {
        try {
          const payload = encodeInputEvent(event);
          inputChannel.send(payload.buffer as ArrayBuffer);
        } catch (e) {
          // eslint-disable-next-line no-console
          console.warn('Failed to send input:', e);
        }
      }
    },
  };
}

/**
 * ICE gathering 완료 대기
 * ICE candidates가 모두 수집될 때까지 기다립니다.
 */
async function waitForIceGathering(
  pc: RTCPeerConnection,
  timeoutMs = 5000
): Promise<void> {
  if (pc.iceGatheringState === 'complete') {
    return;
  }

  return new Promise((resolve) => {
    const timeout = setTimeout(() => {
      // 타임아웃 시에도 현재 상태로 진행 (일부 candidate만 있어도 OK)
      resolve();
    }, timeoutMs);

    pc.onicegatheringstatechange = () => {
      if (pc.iceGatheringState === 'complete') {
        clearTimeout(timeout);
        resolve();
      }
    };

    pc.onicecandidateerror = () => {
      // 무시 - 일부 candidate 수집 실패는 정상
    };
  });
}
