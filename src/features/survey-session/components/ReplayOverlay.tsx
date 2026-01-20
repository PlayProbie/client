/**
 * ReplayOverlay - 인사이트 영상 재생 오버레이
 * IndexedDB/OPFS에 저장된 세그먼트에서 해당 구간 영상 재생
 */

import { X } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';

import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/loading';
import { cn } from '@/lib/utils';

import type { ReplayPreloadState } from '../types';

interface ReplayOverlayProps {
  /** 프리로드 상태 */
  preloadState?: ReplayPreloadState;
  /** 오버레이 닫기 핸들러 */
  onClose: () => void;
}

/** 비디오 사이즈 상수 (360p 비율 - 16:9) */
const VIDEO_WIDTH = 640;
const VIDEO_HEIGHT = 360;

export function ReplayOverlay({
  preloadState,
  onClose,
}: ReplayOverlayProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const isSwitchingRef = useRef(false);
  const preloadStatus = preloadState?.status ?? 'idle';
  const error =
    preloadStatus === 'error'
      ? preloadState?.error ?? '영상을 재생할 수 없습니다.'
      : null;
  const clipSources = preloadState?.sources ?? null;
  const activeSource = clipSources?.[activeIndex] ?? null;
  const isLoading =
    !error &&
    (preloadStatus === 'loading' ||
      preloadStatus === 'idle' ||
      (preloadStatus === 'ready' && !clipSources?.length));

  const advanceSegment = useCallback(() => {
    const video = videoRef.current;
    if (!video || !activeSource || !clipSources?.length) return;
    if (isSwitchingRef.current) return;

    if (clipSources.length === 1) {
      video.currentTime = activeSource.startOffsetMs / 1000;
      void video.play().catch(() => undefined);
      return;
    }

    isSwitchingRef.current = true;
    setActiveIndex((prev) => (prev + 1) % clipSources.length);
  }, [activeSource, clipSources]);

  const handleLoadedMetadata = useCallback(() => {
    const video = videoRef.current;
    if (!video || !activeSource) return;

    isSwitchingRef.current = false;
    video.currentTime = activeSource.startOffsetMs / 1000;
    void video.play().catch(() => undefined);
  }, [activeSource]);

  const handleTimeUpdate = useCallback(() => {
    const video = videoRef.current;
    if (!video || !activeSource || !clipSources?.length) return;
    if (isSwitchingRef.current) return;

    if (video.currentTime >= activeSource.endOffsetMs / 1000) {
      advanceSegment();
    }
  }, [activeSource, advanceSegment, clipSources]);

  const handleSeeked = useCallback(() => {
    const video = videoRef.current;
    if (!video || !activeSource) return;

    const startTime = activeSource.startOffsetMs / 1000;
    const endTime = activeSource.endOffsetMs / 1000;

    if (video.currentTime < startTime) {
      video.currentTime = startTime;
      return;
    }

    if (video.currentTime > endTime) {
      video.currentTime = endTime;
    }
  }, [activeSource]);

  // ESC 키로 닫기
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  return (
    <div
      className="bg-background/80 fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm"
      onClick={onClose}
      onKeyDown={(e) => {
        if (e.key === 'Escape' || e.key === 'Enter') onClose();
      }}
      role="button"
      tabIndex={0}
      aria-label="Close replay overlay"
    >
      <div
        className="bg-card relative overflow-hidden rounded-lg shadow-lg"
        style={{ width: VIDEO_WIDTH, height: VIDEO_HEIGHT }}
        onClick={(e) => e.stopPropagation()}
        onKeyDown={(e) => e.stopPropagation()}
        role="presentation"
      >
        {/* 닫기 버튼 */}
        <Button
          variant="ghost"
          size="icon"
          className="absolute top-2 right-2 z-10"
          onClick={onClose}
        >
          <X className="size-4" />
        </Button>

        {/* 로딩 상태 */}
        {isLoading && (
          <div className="bg-background/50 absolute inset-0 z-20 flex flex-col items-center justify-center gap-4">
            <Skeleton
              className={cn('rounded-none')}
              style={{ width: VIDEO_WIDTH, height: VIDEO_HEIGHT }}
            />
            <div className="text-muted-foreground absolute animate-pulse text-sm font-medium">
              영상을 로딩하고 있습니다...
            </div>
          </div>
        )}

        {/* 에러 상태 */}
        {error && !isLoading && (
          <div
            className="bg-muted flex flex-col items-center justify-center gap-2"
            style={{ width: VIDEO_WIDTH, height: VIDEO_HEIGHT }}
          >
            <Skeleton
              className="bg-muted-foreground/20 rounded-none"
              style={{ width: VIDEO_WIDTH, height: VIDEO_HEIGHT }}
            />
            <div className="text-muted-foreground absolute text-center text-sm">
              {error}
            </div>
          </div>
        )}

        {/* 비디오 플레이어 */}
        {clipSources?.length && !isLoading && !error ? (
          // eslint-disable-next-line jsx-a11y/media-has-caption
          <video
            className="size-full object-contain"
            ref={videoRef}
            src={activeSource?.url}
            controls
            autoPlay
            playsInline
            onLoadedMetadata={handleLoadedMetadata}
            onTimeUpdate={handleTimeUpdate}
            onEnded={advanceSegment}
            onSeeked={handleSeeked}
            style={{ width: VIDEO_WIDTH, height: VIDEO_HEIGHT }}
          />
        ) : null}
      </div>
    </div>
  );
}
