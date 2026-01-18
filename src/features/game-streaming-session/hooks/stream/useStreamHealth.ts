import { useEffect, useRef, useState } from 'react';

export type StreamHealthState = 'HEALTHY' | 'DEGRADED' | 'UNSTABLE';

export interface StreamHealthMetrics {
  packetLoss: number | null; // percentage (0-100)
  rtt: number | null; // ms
  availableIncomingBitrate: number | null; // bps
}

export interface UseStreamHealthOptions {
  /** 모니터링 활성화 여부 */
  enabled?: boolean;
  /** 확인 주기 (ms) */
  intervalMs?: number;
  /** 상태 변경 시 콜백 */
  onStatusChange?: (status: StreamHealthState) => void;
  /** Video RTC Stats 조회 함수 */
  getVideoRTCStats: () => Promise<RTCStatsReport | null>;
  /** Input RTC Stats 조회 함수 */
  getInputRTCStats: () => Promise<RTCStatsReport | null>;
}

export interface UseStreamHealthReturn {
  health: StreamHealthState;
  isUploadAllowed: boolean;
  metrics: StreamHealthMetrics;
}

interface PartialStreamHealthMetrics {
  packetLoss: number | null;
  rtt: number | null;
  availableIncomingBitrate: number | null;
}

function readStreamHealthMetrics(
  stats: RTCStatsReport | null
): PartialStreamHealthMetrics {
  if (!stats) {
    return { packetLoss: null, rtt: null, availableIncomingBitrate: null };
  }

  let currentRtt: number | null = null;
  let availableIncomingBitrate: number | null = null;
  let packetsLost = 0;
  let packetsReceived = 0;
  let hasPacketStats = false;

  stats.forEach((report) => {
    if (report.type === 'candidate-pair' && report.state === 'succeeded') {
      if (typeof report.currentRoundTripTime === 'number') {
        const rttMs = report.currentRoundTripTime * 1000;
        currentRtt = currentRtt == null ? rttMs : Math.max(currentRtt, rttMs);
      }
      if (typeof report.availableIncomingBitrate === 'number') {
        availableIncomingBitrate =
          availableIncomingBitrate == null
            ? report.availableIncomingBitrate
            : Math.min(
                availableIncomingBitrate,
                report.availableIncomingBitrate
              );
      }
    }

    if (report.type === 'inbound-rtp' && report.kind === 'video') {
      packetsLost += report.packetsLost || 0;
      packetsReceived += report.packetsReceived || 0;
      hasPacketStats = true;
    }
  });

  let packetLoss: number | null = null;
  const totalPackets = packetsLost + packetsReceived;
  if (hasPacketStats && totalPackets > 0) {
    packetLoss = (packetsLost / totalPackets) * 100;
  }

  return {
    packetLoss,
    rtt: currentRtt,
    availableIncomingBitrate,
  };
}

function mergeMetric(
  primary: number | null,
  secondary: number | null
): number | null {
  if (primary == null) {
    return secondary ?? null;
  }
  if (secondary == null) {
    return primary;
  }
  return Math.max(primary, secondary);
}

function mergeAvailableIncomingBitrate(
  primary: number | null,
  secondary: number | null
): number | null {
  if (primary == null) {
    return secondary ?? null;
  }
  if (secondary == null) {
    return primary;
  }
  return Math.min(primary, secondary);
}

/**
 * 스트림 상태 판정 함수 (순수 함수)
 */
export function evaluateStreamHealth(
  packetLoss: number | null | undefined,
  rtt: number | null | undefined
): StreamHealthState {
  if (packetLoss == null || rtt == null) {
    return 'UNSTABLE';
  }

  if (packetLoss >= 5 || rtt >= 200) {
    return 'UNSTABLE';
  } else if (packetLoss >= 2 || rtt >= 100) {
    return 'DEGRADED';
  }

  return 'HEALTHY';
}

const DEFAULT_CHECK_INTERVAL_MS = 1000;

/**
 * 스트림 상태 모니터링 훅
 *
 * 주기적으로 WebRTC 통계를 수집하여 네트워크 상태를 판정합니다.
 *
 * [판정 기준]
 * - HEALTHY: packetLoss < 2% AND rtt < 100ms
 * - DEGRADED: packetLoss < 5% AND rtt < 200ms
 * - UNSTABLE: packetLoss >= 5% OR rtt >= 200ms
 */
export function useStreamHealth({
  enabled = true,
  intervalMs = DEFAULT_CHECK_INTERVAL_MS,
  onStatusChange,
  getVideoRTCStats,
  getInputRTCStats,
}: UseStreamHealthOptions): UseStreamHealthReturn {
  const [health, setHealth] = useState<StreamHealthState>('HEALTHY');
  const [metrics, setMetrics] = useState<StreamHealthMetrics>({
    packetLoss: null,
    rtt: null,
    availableIncomingBitrate: null,
  });

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!enabled) {
      return;
    }

    const checkHealth = async () => {
      // getVideoRTCStats/getInputRTCStats를 함께 수집
      const [videoStats, inputStats] = await Promise.all([
        getVideoRTCStats().catch(() => null),
        getInputRTCStats().catch(() => null),
      ]);

      const videoMetrics = readStreamHealthMetrics(videoStats);
      const inputMetrics = readStreamHealthMetrics(inputStats);

      const mergedPacketLoss = mergeMetric(
        videoMetrics.packetLoss,
        inputMetrics.packetLoss
      );
      const mergedRtt = mergeMetric(videoMetrics.rtt, inputMetrics.rtt);
      const mergedAvailableIncomingBitrate = mergeAvailableIncomingBitrate(
        videoMetrics.availableIncomingBitrate,
        inputMetrics.availableIncomingBitrate
      );

      const nextMetrics = {
        packetLoss:
          mergedPacketLoss == null ? null : Number(mergedPacketLoss.toFixed(2)),
        rtt: mergedRtt == null ? null : Math.round(mergedRtt),
        availableIncomingBitrate:
          mergedAvailableIncomingBitrate == null
            ? null
            : Math.round(mergedAvailableIncomingBitrate),
      };
      setMetrics(nextMetrics);

      if (mergedPacketLoss == null || mergedRtt == null) {
        setHealth((prev) => {
          if (prev !== 'UNSTABLE') {
            onStatusChange?.('UNSTABLE');
          }
          return 'UNSTABLE';
        });
        return;
      }

      // 상태 판정
      const newHealth = evaluateStreamHealth(
        nextMetrics.packetLoss,
        nextMetrics.rtt
      );

      setHealth((prev) => {
        if (prev !== newHealth) {
          onStatusChange?.(newHealth);
        }
        return newHealth;
      });
    };

    // 초기 실행
    checkHealth();

    // 주기적 실행
    timerRef.current = setInterval(checkHealth, intervalMs);

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [enabled, intervalMs, getVideoRTCStats, getInputRTCStats, onStatusChange]);

  // 업로드 허용 여부: HEALTHY 또는 DEGRADED 상태일 때 허용
  const isUploadAllowed = health === 'HEALTHY' || health === 'DEGRADED';

  return {
    health,
    isUploadAllowed,
    metrics,
  };
}
