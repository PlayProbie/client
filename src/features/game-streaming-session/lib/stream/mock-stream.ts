/**
 * Mock MediaStream Generator
 *
 * 개발 환경에서 실제 WebRTC 스트림 없이 테스트할 수 있도록
 * Canvas 기반 Mock 비디오 스트림을 생성합니다.
 */

/** Mock 스트림 옵션 */
export interface MockStreamOptions {
  /** 가로 해상도 (기본: 1280) */
  width?: number;
  /** 세로 해상도 (기본: 720) */
  height?: number;
  /** 프레임 레이트 (기본: 30) */
  frameRate?: number;
}

/** 기본 Mock 스트림 설정 */
const DEFAULT_OPTIONS: Required<MockStreamOptions> = {
  width: 1280,
  height: 720,
  frameRate: 30,
};

/**
 * Canvas 기반 Mock MediaStream 생성
 *
 * 애니메이션되는 테스트 패턴을 표시하여
 * 스트리밍 UI가 정상 동작하는지 확인할 수 있습니다.
 */
export function createMockMediaStream(
  options: MockStreamOptions = {}
): MediaStream {
  const { width, height, frameRate } = { ...DEFAULT_OPTIONS, ...options };

  // Offscreen Canvas 생성
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;

  const ctx = canvas.getContext('2d');
  if (!ctx) {
    throw new Error('Canvas 2D context not supported');
  }

  // 애니메이션 변수
  let hue = 0;
  let time = 0;

  // 프레임 렌더링 함수
  const renderFrame = () => {
    // 그라디언트 배경
    const gradient = ctx.createLinearGradient(0, 0, width, height);
    gradient.addColorStop(0, `hsl(${hue}, 70%, 20%)`);
    gradient.addColorStop(0.5, `hsl(${(hue + 60) % 360}, 70%, 15%)`);
    gradient.addColorStop(1, `hsl(${(hue + 120) % 360}, 70%, 20%)`);
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);

    // 움직이는 원형 패턴
    const circles = 5;
    for (let i = 0; i < circles; i++) {
      const angle = (time / 50 + (i * Math.PI * 2) / circles) % (Math.PI * 2);
      const radius = 100 + i * 30;
      const x = width / 2 + Math.cos(angle) * radius;
      const y = height / 2 + Math.sin(angle) * radius;

      ctx.beginPath();
      ctx.arc(x, y, 20 + i * 5, 0, Math.PI * 2);
      ctx.fillStyle = `hsla(${(hue + i * 40) % 360}, 80%, 60%, 0.7)`;
      ctx.fill();
    }

    // 중앙 텍스트
    ctx.fillStyle = 'white';
    ctx.font = 'bold 48px Inter, system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('🎮 Mock Stream', width / 2, height / 2 - 40);

    ctx.font = '24px Inter, system-ui, sans-serif';
    ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
    ctx.fillText(
      `${width}x${height} @ ${frameRate}fps`,
      width / 2,
      height / 2 + 20
    );

    ctx.font = '18px Inter, system-ui, sans-serif';
    ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
    ctx.fillText('개발 환경 테스트 스트림', width / 2, height / 2 + 60);

    // 타임스탬프
    const now = new Date().toLocaleTimeString('ko-KR');
    ctx.font = '16px monospace';
    ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
    ctx.textAlign = 'right';
    ctx.fillText(now, width - 20, height - 20);

    // 애니메이션 값 업데이트
    hue = (hue + 0.5) % 360;
    time += 1;
  };

  // 애니메이션 시작
  const intervalId = setInterval(renderFrame, 1000 / frameRate);

  // Canvas에서 MediaStream 추출
  const stream = canvas.captureStream(frameRate);

  // 스트림 종료 시 정리를 위한 커스텀 프로퍼티 추가
  (stream as MediaStream & { _mockCleanup?: () => void })._mockCleanup = () => {
    clearInterval(intervalId);
  };

  return stream;
}

/**
 * Mock 스트림 정리
 * @param stream - createMockMediaStream으로 생성된 스트림
 */
export function cleanupMockStream(stream: MediaStream): void {
  const mockStream = stream as MediaStream & { _mockCleanup?: () => void };
  mockStream._mockCleanup?.();

  // 트랙 중지
  stream.getTracks().forEach((track) => track.stop());
}
