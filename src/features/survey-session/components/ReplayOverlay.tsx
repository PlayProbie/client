/**
 * ReplayOverlay - 인사이트 영상 재생 오버레이
 * IndexedDB/OPFS에 저장된 세그먼트에서 해당 구간 영상 재생
 */

import { X } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';

import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/loading';
import { cn } from '@/lib/utils';

import type { InsightQuestionData } from '../types';

interface ReplayOverlayProps {
  /** 인사이트 질문 데이터 */
  insightQuestion: InsightQuestionData;
  /** 세션 ID (segment-store 조회용) */
  sessionId: string;
  /** 오버레이 닫기 핸들러 */
  onClose: () => void;
}

/** 비디오 사이즈 상수 (360p 비율 - 16:9) */
const VIDEO_WIDTH = 640;
const VIDEO_HEIGHT = 360;

export function ReplayOverlay({
  insightQuestion,
  sessionId,
  onClose,
}: ReplayOverlayProps) {
  const [blobUrl, setBlobUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  /** 세그먼트 시작 시간 (video_start_ms 오프셋 계산용) */
  const [segmentStartMs, setSegmentStartMs] = useState(0);

  // 세그먼트 스토어에서 해당 시간대 세그먼트 조회
  const loadSegment = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      // 동적 import로 segment-store 로드
      const { createSegmentStore } =
        await import('@/features/game-streaming-session/lib/store/segment-store');
      const { findSegmentByMediaTime } =
        await import('@/features/game-streaming-session/lib/store/segment-store.utils');

      const store = await createSegmentStore({ sessionId });
      const segments = await store.listSegments();

      // 해당 시간대 세그먼트 찾기
      const segment = findSegmentByMediaTime(
        segments,
        insightQuestion.videoStartMs
      );

      if (!segment) {
        setError('해당 구간의 영상을 찾을 수 없습니다.');
        setIsLoading(false);
        return;
      }

      // Blob 조회
      const result = await store.getSegment(segment.segment_id);
      if (!result) {
        setError('영상을 재생할 수 없습니다.');
        setIsLoading(false);
        return;
      }

      // 세그먼트 시작 시간 저장 (오프셋 계산용)
      // 실제 녹화 시작 = start_media_time - overlap_ms
      setSegmentStartMs(segment.start_media_time - segment.overlap_ms);

      // Blob URL 생성
      const url = URL.createObjectURL(result.blob);
      setBlobUrl(url);
      setIsLoading(false);
    } catch {
      setError('영상을 재생할 수 없습니다.');
      setIsLoading(false);
    }
  }, [sessionId, insightQuestion.videoStartMs]);

  useEffect(() => {
    loadSegment();
  }, [loadSegment]);

  // Blob URL cleanup on unmount
  useEffect(() => {
    return () => {
      if (blobUrl) {
        URL.revokeObjectURL(blobUrl);
      }
    };
  }, [blobUrl]);

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

  // 비디오 시작 시간 계산 (세그먼트 내 오프셋)
  const handleVideoLoaded = useCallback(
    (video: HTMLVideoElement) => {
      // video_start_ms 기준으로 세그먼트 내 오프셋 계산
      // 오프셋 = (video_start_ms - 세그먼트 실제 시작 시간) / 1000 (초 단위)
      const offsetMs = insightQuestion.videoStartMs - segmentStartMs;
      const offsetSec = Math.max(0, offsetMs / 1000);

      video.currentTime = offsetSec;
      video.play().catch(() => {
        // 자동 재생 실패 시 무시
      });
    },
    [insightQuestion.videoStartMs, segmentStartMs]
  );

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
          <div className="absolute inset-0 flex items-center justify-center">
            <Skeleton
              className={cn('rounded-none')}
              style={{ width: VIDEO_WIDTH, height: VIDEO_HEIGHT }}
            />
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
        {blobUrl && !isLoading && !error && (
          // eslint-disable-next-line jsx-a11y/media-has-caption
          <video
            className="size-full object-contain"
            src={blobUrl}
            controls
            autoPlay
            playsInline
            ref={(ref) => {
              if (ref) handleVideoLoaded(ref);
            }}
            style={{ width: VIDEO_WIDTH, height: VIDEO_HEIGHT }}
          />
        )}
      </div>
    </div>
  );
}
