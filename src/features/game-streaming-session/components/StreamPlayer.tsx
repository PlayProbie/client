/**
 * 스트리밍 플레이어 컴포넌트
 *
 * WebRTC 스트림을 표시하는 비디오 플레이어입니다.
 */
import { Maximize, Minimize, Volume2, VolumeX } from 'lucide-react';
import { useCallback, useRef, useState } from 'react';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export interface StreamPlayerProps {
  /** Video element ref */
  videoRef: React.RefObject<HTMLVideoElement | null>;
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
 *   isConnected={isConnected}
 *   onDisconnect={handleDisconnect}
 * />
 * ```
 */
export function StreamPlayer({
  videoRef,
  isConnected,
  isConnecting = false,
  onDisconnect,
  className,
}: StreamPlayerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const toggleMute = useCallback(() => {
    if (videoRef.current) {
      videoRef.current.muted = !videoRef.current.muted;
      setIsMuted(videoRef.current.muted);
    }
  }, [videoRef]);

  const toggleFullscreen = useCallback(async () => {
    if (!containerRef.current) return;

    try {
      if (document.fullscreenElement) {
        await document.exitFullscreen();
        setIsFullscreen(false);
      } else {
        await containerRef.current.requestFullscreen();
        setIsFullscreen(true);
      }
    } catch {
      // Fullscreen not supported - 무시
    }
  }, []);

  // Fullscreen 상태는 toggleFullscreen에서 직접 관리

  return (
    <div
      ref={containerRef}
      className={cn(
        'bg-muted relative aspect-video overflow-hidden rounded-lg',
        className
      )}
      onDoubleClick={toggleFullscreen}
    >
      {/* Video Element */}
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted={isMuted}
        className="h-full w-full object-contain"
      >
        <track kind="captions" />
      </video>

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

      {/* 컨트롤 바 (연결 시에만 표시) */}
      {isConnected && (
        <div className="absolute right-0 bottom-0 left-0 flex items-center justify-between bg-gradient-to-t from-black/60 to-transparent p-4 opacity-0 transition-opacity hover:opacity-100">
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
