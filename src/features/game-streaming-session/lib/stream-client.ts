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
}

/** 기본 ICE 서버 설정 (Google STUN) */
const DEFAULT_ICE_SERVERS: RTCIceServer[] = [
  { urls: 'stun:stun.l.google.com:19302' },
  { urls: 'stun:stun1.l.google.com:19302' },
];

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

    // ICE candidate 에러 처리 (에러가 발생해도 연결 시도는 계속)
    pc.onicecandidateerror = () => {
      // 무시 - 일부 candidate 수집 실패는 정상
    };
  });
}
