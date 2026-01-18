/**
 * 미디어 시간 추적 훅
 *
 * requestVideoFrameCallback 우선, fallback currentTime으로
 * media_time을 밀리초 정수로 반환합니다.
 */
import { useCallback, useEffect, useRef } from 'react';

export interface UseMediaTimeOptions {
  /** 비디오 엘리먼트 */
  videoElement:
    | HTMLVideoElement
    | React.RefObject<HTMLVideoElement | null>
    | null;
  /** 활성화 여부 */
  enabled: boolean;
}

export interface UseMediaTimeReturn {
  /** 현재 media_time (ms 정수) */
  getMediaTime: () => number;
}

export function useMediaTime(options: UseMediaTimeOptions): UseMediaTimeReturn {
  const { videoElement, enabled } = options;

  // media_time 캐시 (rVFC 사용 시)
  const mediaTimeRef = useRef<number>(0);

  // requestVideoFrameCallback (rVFC) - 고정밀 media_time 추적
  useEffect(() => {
    // RefObject인 경우 current 값 사용
    const element =
      videoElement && 'current' in videoElement
        ? videoElement.current
        : (videoElement as HTMLVideoElement | null);

    if (!element || !enabled) return;

    // rVFC 지원 여부 확인
    if (typeof element.requestVideoFrameCallback !== 'function') {
      // rVFC 미지원 시 currentTime 폴링 (16ms)
      let intervalId: number | null = null;

      const updateMediaTime = () => {
        mediaTimeRef.current = Math.round(element.currentTime * 1000);
      };

      updateMediaTime();
      intervalId = window.setInterval(updateMediaTime, 16);

      return () => {
        if (intervalId !== null) {
          clearInterval(intervalId);
        }
      };
    }

    let rafId: number | null = null;

    const updateMediaTime = (
      _now: DOMHighResTimeStamp,
      metadata: { mediaTime: number }
    ) => {
      // mediaTime은 초 단위 → ms 정수로 변환
      mediaTimeRef.current = Math.round(metadata.mediaTime * 1000);
      rafId = element.requestVideoFrameCallback(updateMediaTime);
    };

    rafId = element.requestVideoFrameCallback(updateMediaTime);

    return () => {
      if (rafId !== null) {
        element.cancelVideoFrameCallback?.(rafId);
      }
    };
  }, [videoElement, enabled]);

  // media_time getter (ms 정수로 반환)
  const getMediaTime = useCallback((): number => {
    const element =
      videoElement && 'current' in videoElement
        ? videoElement.current
        : (videoElement as HTMLVideoElement | null);

    if (!element) return 0;

    // rVFC 캐시 값이 있으면 사용
    if (mediaTimeRef.current > 0) {
      return mediaTimeRef.current;
    }

    // fallback: currentTime (초 → ms 정수)
    const timeInSeconds = element.currentTime;
    return Math.round(timeInSeconds * 1000);
  }, [videoElement]);

  return { getMediaTime };
}
