/**
 * 스트리밍 플레이어 컴포넌트
 *
 * WebRTC 스트림을 표시하는 비디오 플레이어입니다.
 */
import { Maximize, Minimize, Volume2, VolumeX } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

import type { StreamInputEvent } from '../lib';

export interface StreamPlayerProps {
  /** Video element ref */
  videoRef: React.RefObject<HTMLVideoElement | null>;
  /** 연결됨 상태 */
  isConnected: boolean;
  /** 연결 중 상태 */
  isConnecting?: boolean;
  /** 연결 해제 콜백 */
  onDisconnect?: () => void;
  /** 입력 이벤트 전송 콜백 */
  sendInput?: (event: StreamInputEvent) => void;
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
 *   sendInput={sendInput}
 * />
 * ```
 */
export function StreamPlayer({
  videoRef,
  isConnected,
  isConnecting = false,
  onDisconnect,
  sendInput,
  className,
}: StreamPlayerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const controlsRef = useRef<HTMLDivElement>(null);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    if (isConnected) {
      containerRef.current?.focus();
    }
  }, [isConnected]);

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

  const isEventFromControls = useCallback((event: React.SyntheticEvent) => {
    const target = event.target as HTMLElement | null;
    if (!target) return false;
    if (!controlsRef.current?.contains(target)) return false;
    return !!target.closest('button');
  }, []);

  const getNormalizedPointer = useCallback(
    (event: React.MouseEvent<HTMLDivElement>) => {
      const rect = containerRef.current?.getBoundingClientRect();
      if (!rect || rect.width === 0 || rect.height === 0) {
        return { x: 0, y: 0 };
      }

      const normalizedX = (event.clientX - rect.left) / rect.width;
      const normalizedY = (event.clientY - rect.top) / rect.height;

      return {
        x: Math.round(Math.min(1, Math.max(0, normalizedX)) * 65535),
        y: Math.round(Math.min(1, Math.max(0, normalizedY)) * 65535),
      };
    },
    []
  );

  const handleKeyboardInput = useCallback(
    (action: 'down' | 'up', event: React.KeyboardEvent<HTMLDivElement>) => {
      if (!isConnected || !sendInput) return;
      if (isEventFromControls(event)) return;

      event.preventDefault();

      sendInput({
        kind: 'keyboard',
        action,
        keyCode: event.keyCode || 0,
        altKey: event.altKey,
        ctrlKey: event.ctrlKey,
        shiftKey: event.shiftKey,
        metaKey: event.metaKey,
        repeat: event.repeat,
      });
    },
    [isConnected, sendInput, isEventFromControls]
  );

  const handleMouseInput = useCallback(
    (
      action: 'move' | 'down' | 'up',
      event: React.MouseEvent<HTMLDivElement>
    ) => {
      if (!isConnected || !sendInput) return;
      if (isEventFromControls(event)) return;

      const { x, y } = getNormalizedPointer(event);

      if (action !== 'move') {
        event.preventDefault();
      }

      sendInput({
        kind: 'mouse',
        action,
        x,
        y,
        button: event.button,
        buttons: event.buttons,
        movementX: event.movementX,
        movementY: event.movementY,
      });
    },
    [getNormalizedPointer, isConnected, sendInput, isEventFromControls]
  );

  return (
    // eslint-disable-next-line jsx-a11y/no-noninteractive-element-interactions
    <div
      ref={containerRef}
      className={cn(
        'bg-muted relative aspect-video overflow-hidden rounded-lg outline-none',
        className
      )}
      role="application"
      aria-label="게임 스트리밍 플레이어"
      onDoubleClick={toggleFullscreen}
      onClick={() => {
        if (isConnected) {
          containerRef.current?.focus();
        }
      }}
      // eslint-disable-next-line jsx-a11y/no-noninteractive-tabindex
      tabIndex={0} // 키보드 입력을 받기 위해 tabIndex 추가
      onKeyDown={(e) => handleKeyboardInput('down', e)}
      onKeyUp={(e) => handleKeyboardInput('up', e)}
      onMouseDown={(e) => handleMouseInput('down', e)}
      onMouseUp={(e) => handleMouseInput('up', e)}
      onMouseMove={(e) => handleMouseInput('move', e)}
      onContextMenu={(e) => {
        e.preventDefault(); // 우클릭 메뉴 방지
      }}
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
