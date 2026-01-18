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

  // 세그먼트 스토어에서 해당 시간대 세그먼트 조회
  const loadSegment = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      // 동적 import
      const { createSegmentStore } =
        await import('@/features/game-streaming-session/lib/store/segment-store');
      const { findSegmentsByTimeRange } =
        await import('@/features/game-streaming-session/lib/store/segment-store.utils');
      const { stitchVideoBlobs } = await import('../lib/video-utils');
      // eslint-disable-next-line @typescript-eslint/consistent-type-imports
      type VideoSource = import('../lib/video-utils').VideoSource;

      const store = await createSegmentStore({ sessionId });
      const segments = await store.listSegments();

      // 범위 내 모든 세그먼트 찾기
      const targetSegments = findSegmentsByTimeRange(
        segments,
        insightQuestion.videoStartMs,
        insightQuestion.videoEndMs
      );

      if (targetSegments.length === 0) {
        setError('해당 구간의 영상을 찾을 수 없습니다.');
        setIsLoading(false);
        return;
      }

      const sources: VideoSource[] = [];

      for (const seg of targetSegments) {
        // Blob 조회
        const result = await store.getSegment(seg.segment_id);
        if (!result) continue;

        // 세그먼트 실제 시작 시간 (오버랩 포함)
        const segStart =
          seg.start_media_time === 0
            ? 0
            : seg.start_media_time - seg.overlap_ms;
        const segEnd = seg.end_media_time + seg.overlap_ms;

        // 요청된 구간과의 교집합 계산
        const overlapStart = Math.max(insightQuestion.videoStartMs, segStart);
        const overlapEnd = Math.min(insightQuestion.videoEndMs, segEnd);

        if (overlapEnd > overlapStart) {
          sources.push({
            blob: result.blob,
            startOffset: overlapStart - segStart,
            endOffset: overlapEnd - segStart,
          });
        }
      }

      if (sources.length === 0) {
        setError('영상 구간 정보를 불러올 수 없습니다.');
        setIsLoading(false);
        return;
      }

      // 스티칭 (하나여도 재인코딩을 통해 클립 생성)
      try {
        const stitchedBlob = await stitchVideoBlobs(sources);
        const url = URL.createObjectURL(stitchedBlob);
        setBlobUrl(url);
      } catch (err) {
        console.error('Stitch generation failed:', err);
        setError('영상 구간 병합에 실패했습니다.');
      } finally {
        setIsLoading(false);
      }
    } catch (err) {
      console.error('Segment load failed:', err);
      setError('영상을 재생할 수 없습니다.');
      setIsLoading(false);
    }
  }, [sessionId, insightQuestion]);

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
        {blobUrl && !isLoading && !error && (
          // eslint-disable-next-line jsx-a11y/media-has-caption
          <video
            className="size-full object-contain"
            src={blobUrl}
            controls
            autoPlay
            playsInline
            loop
            style={{ width: VIDEO_WIDTH, height: VIDEO_HEIGHT }}
          />
        )}
      </div>
    </div>
  );
}
