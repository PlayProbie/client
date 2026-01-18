/**
 * 입력 로그 저장소 훅
 *
 * 로그 배열 관리, 추가, 초기화를 담당합니다.
 * IndexedDB에도 실시간으로 저장하여 탭 종료 시에도 보존합니다.
 */
import { useCallback, useEffect, useRef, useState } from 'react';

import { DEFAULT_BATCH_SIZE } from '../../constants';
import {
  deleteInputLogsBySegment,
  saveInputLog,
} from '../../lib/input-log/input-log-store.idb';
import type { InputLog } from '../../types';

export interface UseInputLogStoreOptions {
  /** 세션 ID */
  sessionId: string;
  /** 배치 크기 (기본값: 100) */
  batchSize?: number;
  /** 로그 배치 콜백 */
  onLogBatch?: (logs: InputLog[]) => void;
}

export interface UseInputLogStoreReturn {
  /** 로그 복사본 반환 */
  getLogs: () => InputLog[];
  /** 로그 개수 */
  logCount: number;
  /** 로그 추가 */
  addLog: (log: InputLog) => void;
  /** 로그 초기화 */
  clearLogs: () => void;
  /** 세그먼트별 로그 초기화 */
  clearLogsBySegment: (segmentId: string) => void;
  /** 세그먼트별 로그 조회 */
  getLogsBySegment: (segmentId: string) => InputLog[];
  /** 로그가 있는 세그먼트 ID 목록 */
  getSegmentIdsWithLogs: () => string[];
  /** 세그먼트별 로그 가져오고 비우기 */
  drainLogsBySegment: (segmentId: string) => InputLog[];
  /** 현재 세그먼트 ID */
  currentSegmentId: string;
  /** 현재 세그먼트 ID ref (필터에서 사용) */
  currentSegmentIdRef: React.RefObject<string>;
}

export function useInputLogStore(
  options: UseInputLogStoreOptions
): UseInputLogStoreReturn {
  const { sessionId, batchSize = DEFAULT_BATCH_SIZE, onLogBatch } = options;

  // 세그먼트별 로그 저장소 (리렌더 최적화: state 대신 ref 사용)
  const logsBySegmentRef = useRef<Map<string, InputLog[]>>(new Map());
  const totalLogCountRef = useRef(0);
  const batchBufferRef = useRef<InputLog[]>([]);
  // 디버깅용 로그 개수 (선택적 리렌더)
  const [logCount, setLogCount] = useState(0);

  // 현재 세그먼트 ID
  const [currentSegmentId, setCurrentSegmentId] = useState(
    () => `seg_${sessionId}_${Date.now()}`
  );

  // sessionId가 변경될 때마다 새로운 세그먼트 ID 생성
  useEffect(() => {
    setCurrentSegmentId(`seg_${sessionId}_${Date.now()}`);
  }, [sessionId]);

  const currentSegmentIdRef = useRef(currentSegmentId);

  // 세그먼트 ID 업데이트 시 ref도 동기화
  useEffect(() => {
    currentSegmentIdRef.current = currentSegmentId;
  }, [currentSegmentId]);

  const normalizeSegmentIds = useCallback((log: InputLog): string[] => {
    const candidates =
      log.segment_ids && log.segment_ids.length > 0
        ? [...log.segment_ids, log.segment_id]
        : [log.segment_id];
    const unique = Array.from(
      new Set(candidates.filter((segmentId) => Boolean(segmentId)))
    );
    if (unique.length === 0 && log.segment_id) {
      unique.push(log.segment_id);
    }
    return unique;
  }, []);

  // 로그 추가 함수 (리렌더 최적화)
  const addLog = useCallback(
    (log: InputLog) => {
      const segmentIds = normalizeSegmentIds(log);
      if (segmentIds.length === 0) return;

      const storedLogs: InputLog[] = [];
      segmentIds.forEach((segmentId) => {
        const normalizedLog =
          segmentId === log.segment_id
            ? log
            : { ...log, segment_id: segmentId };
        const existing = logsBySegmentRef.current.get(segmentId) ?? [];
        existing.push(normalizedLog);
        logsBySegmentRef.current.set(segmentId, existing);
        storedLogs.push(normalizedLog);

        // IndexedDB에 실시간 저장 (비동기, 에러 무시)
        saveInputLog(
          sessionId,
          segmentId,
          normalizedLog,
          normalizedLog.media_time ?? 0
        ).catch(() => {
          // IndexedDB 저장 실패 시 무시 (메모리에는 저장됨)
        });
      });

      // 배치 콜백 및 디버깅용 카운트 업데이트
      totalLogCountRef.current += storedLogs.length;
      batchBufferRef.current.push(...storedLogs);

      while (batchBufferRef.current.length >= batchSize) {
        const batch = batchBufferRef.current.splice(0, batchSize);
        setLogCount(totalLogCountRef.current); // 배치 단위로만 리렌더
        onLogBatch?.(batch);
      }
    },
    [batchSize, normalizeSegmentIds, onLogBatch, sessionId]
  );

  // 메모리 로그 초기화 (IndexedDB는 인터뷰 완료 시 별도 정리)
  const clearLogs = useCallback(() => {
    logsBySegmentRef.current.clear();
    totalLogCountRef.current = 0;
    batchBufferRef.current = [];
    setLogCount(0);
  }, []);

  const clearLogsBySegment = useCallback((segmentId: string) => {
    const logs = logsBySegmentRef.current.get(segmentId);
    if (!logs) return;

    logsBySegmentRef.current.delete(segmentId);
    totalLogCountRef.current = Math.max(
      0,
      totalLogCountRef.current - logs.length
    );
    setLogCount(totalLogCountRef.current);

    // IndexedDB에서도 삭제
    deleteInputLogsBySegment(segmentId).catch(() => {});
  }, []);

  // 로그 복사본 반환
  const getLogs = useCallback((): InputLog[] => {
    const merged: InputLog[] = [];
    logsBySegmentRef.current.forEach((logs) => {
      merged.push(...logs);
    });
    return merged;
  }, []);

  // 세그먼트별 로그 조회
  const getLogsBySegment = useCallback((segmentId: string): InputLog[] => {
    return [...(logsBySegmentRef.current.get(segmentId) ?? [])];
  }, []);

  const getSegmentIdsWithLogs = useCallback((): string[] => {
    return Array.from(logsBySegmentRef.current.entries())
      .filter(([, logs]) => logs.length > 0)
      .map(([segmentId]) => segmentId);
  }, []);

  const drainLogsBySegment = useCallback((segmentId: string): InputLog[] => {
    const logs = logsBySegmentRef.current.get(segmentId);
    if (!logs || logs.length === 0) return [];

    logsBySegmentRef.current.delete(segmentId);
    totalLogCountRef.current = Math.max(
      0,
      totalLogCountRef.current - logs.length
    );
    setLogCount(totalLogCountRef.current);
    return [...logs];
  }, []);

  return {
    getLogs,
    logCount,
    addLog,
    clearLogs,
    clearLogsBySegment,
    getLogsBySegment,
    getSegmentIdsWithLogs,
    drainLogsBySegment,
    currentSegmentId,
    currentSegmentIdRef,
  };
}
