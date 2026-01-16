/**
 * 전체화면 관리 훅
 *
 * Vendor-prefixed fullscreen API를 지원합니다.
 */
import { useCallback } from 'react';

export interface UseFullscreenOptions {
  /** 에러 발생 시 콜백 */
  onError?: (error: Error) => void;
}

export interface UseFullscreenReturn {
  /** 전체화면 전환 요청 */
  requestFullscreen: () => void;
  /** 전체화면 해제 */
  exitFullscreen: () => void;
}

/** Vendor-prefixed fullscreen API 타입 */
type FullscreenElement = HTMLElement & {
  webkitRequestFullscreen?: () => Promise<void>;
  msRequestFullscreen?: () => Promise<void>;
};

type FullscreenDocument = Document & {
  webkitExitFullscreen?: () => Promise<void>;
  msExitFullscreen?: () => Promise<void>;
};

export function useFullscreen(
  options?: UseFullscreenOptions
): UseFullscreenReturn {
  const { onError } = options || {};

  const requestFullscreen = useCallback(() => {
    // Loading Screen(body 자식)을 포함하기 위해 documentElement를 전체화면 대상으로 설정
    const element = document.documentElement;
    if (!element) return;

    const el = element as FullscreenElement;

    if (el.requestFullscreen) {
      el.requestFullscreen().catch((err) => {
        onError?.(err);
      });
    } else if (el.webkitRequestFullscreen) {
      el.webkitRequestFullscreen();
    } else if (el.msRequestFullscreen) {
      el.msRequestFullscreen();
    }
  }, [onError]);

  const exitFullscreen = useCallback(() => {
    const doc = document as FullscreenDocument;

    if (doc.exitFullscreen) {
      doc.exitFullscreen().catch(() => {
        // 무시
      });
    } else if (doc.webkitExitFullscreen) {
      doc.webkitExitFullscreen();
    } else if (doc.msExitFullscreen) {
      doc.msExitFullscreen();
    }
  }, []);

  return {
    requestFullscreen,
    exitFullscreen,
  };
}
