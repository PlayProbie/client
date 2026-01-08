/**
 * 스트리밍 플레이어 컴포넌트
 *
 * AWS GameLift Streams Web SDK를 통해 WebRTC 스트림을 표시합니다.
 * 입력(키보드/마우스/게임패드)은 SDK에서 자동으로 처리합니다.
 */
import { Maximize, Minimize, Volume2, VolumeX } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export interface StreamPlayerProps {
  /** Video element ref */
  videoRef: React.RefObject<HTMLVideoElement | null>;
  /** Audio element ref */
  audioRef: React.RefObject<HTMLAudioElement | null>;
  /** 연결됨 상태 */
  isConnected: boolean;
  /** 연결 중 상태 */
  isConnecting?: boolean;
  /** 연결 해제 콜백 */
  onDisconnect?: () => void;
  /** 추가 CSS 클래스 */
  className?: string;
}

/**
 * 스트리밍 플레이어
 *
 * @example
 * ```tsx
 * <StreamPlayer
 *   videoRef={videoRef}
 *   audioRef={audioRef}
 *   isConnected={isConnected}
 *   onDisconnect={handleDisconnect}
 * />
 * ```
 */
export function StreamPlayer({
  videoRef,
  audioRef,
  isConnected,
  isConnecting = false,
  onDisconnect,
  className,
}: StreamPlayerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const controlsRef = useRef<HTMLDivElement>(null);
  const [isMuted, setIsMuted] = useState(true); // 기본값 true로 변경 (자동재생 정책)
  const [isFullscreen, setIsFullscreen] = useState(false);

  // 연결 시 컨테이너에 포커스
  useEffect(() => {
    if (isConnected) {
      containerRef.current?.focus();
    }
  }, [isConnected]);

  // 풀스크린 상태 변경 감지
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, []);

  const toggleMute = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.muted = !audioRef.current.muted;
      setIsMuted(audioRef.current.muted);
    }
    if (videoRef.current) {
      videoRef.current.muted = !videoRef.current.muted;
    }
  }, [audioRef, videoRef]);

  // 컨테이너 클릭 시 음소거 해제 (자동재생 정책 우회)
  const handleContainerClick = useCallback(() => {
    if (isConnected) {
      containerRef.current?.focus();

      // 첫 클릭 시 음소거 해제
      if (isMuted && audioRef.current && videoRef.current) {
        audioRef.current.muted = false;
        videoRef.current.muted = false;
        setIsMuted(false);

        // play() 재시도
        audioRef.current.play().catch(() => {});
        videoRef.current.play().catch(() => {});
      }
    }
  }, [audioRef, videoRef, isConnected, isMuted]);

  const toggleFullscreen = useCallback(async () => {
    if (!containerRef.current) return;

    try {
      if (document.fullscreenElement) {
        await document.exitFullscreen();
      } else {
        await containerRef.current.requestFullscreen();
      }
    } catch {
      // Fullscreen not supported - 무시
    }
  }, []);

  return (
    /* eslint-disable jsx-a11y/click-events-have-key-events, jsx-a11y/no-noninteractive-element-interactions, jsx-a11y/no-noninteractive-tabindex */
    // 게임 스트리밍 플레이어: 키보드/마우스 입력을 받는 인터랙티브 애플리케이션
    <div
      ref={containerRef}
      className={cn(
        'bg-muted relative aspect-video overflow-hidden rounded-lg outline-none',
        className
      )}
      role="application"
      aria-label="게임 스트리밍 플레이어"
      onDoubleClick={toggleFullscreen}
      onClick={handleContainerClick}
      tabIndex={0} // 키보드 입력을 위해 tabIndex 추가 (SDK가 입력 캡처)
      onContextMenu={(e) => {
        e.preventDefault(); // 우클릭 메뉴 방지
      }}
    >
      {/* eslint-enable jsx-a11y/click-events-have-key-events, jsx-a11y/no-noninteractive-element-interactions, jsx-a11y/no-noninteractive-tabindex */}
      {/* Video Element */}
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted // 자동재생 정책 준수
        className="h-full w-full object-contain"
      >
        <track kind="captions" />
      </video>

      {/* Audio Element (별도 audio 태그로 분리) */}
      {}
      <audio
        ref={audioRef}
        autoPlay
        muted // 자동재생 정책 준수
      />

      {/* 연결 대기 오버레이 */}
      {!isConnected && !isConnecting && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/80">
          <p className="text-muted-foreground text-sm">
            스트리밍 연결을 시작하세요
          </p>
        </div>
      )}

      {/* 연결 중 오버레이 */}
      {isConnecting && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/80">
          <div className="flex flex-col items-center gap-2">
            <div className="border-primary h-8 w-8 animate-spin rounded-full border-2 border-t-transparent" />
            <p className="text-muted-foreground text-sm">연결 중...</p>
          </div>
        </div>
      )}

      {/* 음소거 해제 안내 (연결 후 음소거 상태일 때) */}
      {isConnected && isMuted && (
        <div className="pointer-events-none absolute inset-0 flex items-end justify-center pb-20">
          <div className="animate-pulse rounded-full bg-black/70 px-4 py-2">
            <p className="text-sm text-white">
              🔇 화면을 클릭하여 소리를 켜세요
            </p>
          </div>
        </div>
      )}

      {/* 컨트롤 바 (연결 시에만 표시) */}
      {isConnected && (
        <div
          ref={controlsRef}
          className="absolute right-0 bottom-0 left-0 flex items-center justify-between bg-gradient-to-t from-black/60 to-transparent p-4 opacity-0 transition-opacity hover:opacity-100"
        >
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="ghost"
              onClick={toggleMute}
              className="text-white hover:bg-white/20"
            >
              {isMuted ? (
                <VolumeX className="h-5 w-5" />
              ) : (
                <Volume2 className="h-5 w-5" />
              )}
            </Button>
          </div>

          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="ghost"
              onClick={toggleFullscreen}
              className="text-white hover:bg-white/20"
            >
              {isFullscreen ? (
                <Minimize className="h-5 w-5" />
              ) : (
                <Maximize className="h-5 w-5" />
              )}
            </Button>

            {onDisconnect && (
              <Button
                size="sm"
                variant="destructive"
                onClick={onDisconnect}
                className="text-xs"
              >
                종료
              </Button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
