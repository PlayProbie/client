/**
 * 세션 타이머 훅
 *
 * 게임 세션의 남은 시간을 관리합니다.
 */
import { useCallback, useEffect, useState } from 'react';

export interface UseSessionTimerOptions {
  /** 최대 세션 시간 (초) */
  maxDuration: number;
  /** 타이머 활성화 여부 */
  enabled: boolean;
  /** 시간 만료 시 콜백 */
  onExpired?: () => void;
}

export interface UseSessionTimerReturn {
  /** 남은 시간 (초) */
  remainingTime: number;
  /** 타이머 리셋 */
  resetTimer: () => void;
}

export function useSessionTimer(
  options: UseSessionTimerOptions
): UseSessionTimerReturn {
  const { maxDuration, enabled, onExpired } = options;

  const [remainingTime, setRemainingTime] = useState(maxDuration);

  // 타이머 리셋
  const resetTimer = useCallback(() => {
    setRemainingTime(maxDuration);
  }, [maxDuration]);

  // 카운트다운
  useEffect(() => {
    if (!enabled) return;

    const timer = setInterval(() => {
      setRemainingTime((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [enabled]);

  // 시간 만료 시 콜백
  useEffect(() => {
    if (remainingTime === 0 && enabled && onExpired) {
      onExpired();
    }
  }, [remainingTime, enabled, onExpired]);

  return {
    remainingTime,
    resetTimer,
  };
}
