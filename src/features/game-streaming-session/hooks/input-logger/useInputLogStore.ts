/**
 * 입력 로그 저장소 훅
 *
 * 로그 배열 관리, 추가, 초기화를 담당합니다.
 */
import { useCallback, useEffect, useRef, useState } from 'react';

import type { InputLog } from '../../types/highlight';
import { DEFAULT_BATCH_SIZE } from './constants';

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
  /** 세그먼트별 로그 조회 */
  getLogsBySegment: (segmentId: string) => InputLog[];
  /** 현재 세그먼트 ID */
  currentSegmentId: string;
  /** 현재 세그먼트 ID ref (필터에서 사용) */
  currentSegmentIdRef: React.RefObject<string>;
}

export function useInputLogStore(
  options: UseInputLogStoreOptions
): UseInputLogStoreReturn {
  const { sessionId, batchSize = DEFAULT_BATCH_SIZE, onLogBatch } = options;

  // 로그 저장소 (리렌더 최적화: state 대신 ref 사용)
  const logsRef = useRef<InputLog[]>([]);
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

  // 로그 추가 함수 (리렌더 최적화)
  const addLog = useCallback(
    (log: InputLog) => {
      logsRef.current.push(log);

      // 배치 콜백 및 디버깅용 카운트 업데이트
      if (logsRef.current.length % batchSize === 0) {
        setLogCount(logsRef.current.length); // 배치 단위로만 리렌더
        if (onLogBatch) {
          const batch = logsRef.current.slice(-batchSize);
          onLogBatch(batch);
        }
      }
    },
    [onLogBatch, batchSize]
  );

  // 로그 초기화
  const clearLogs = useCallback(() => {
    logsRef.current = [];
    setLogCount(0);
  }, []);

  // 로그 복사본 반환
  const getLogs = useCallback((): InputLog[] => {
    return [...logsRef.current];
  }, []);

  // 세그먼트별 로그 조회
  const getLogsBySegment = useCallback((segmentId: string): InputLog[] => {
    return logsRef.current.filter((log) => log.segment_id === segmentId);
  }, []);

  return {
    getLogs,
    logCount,
    addLog,
    clearLogs,
    getLogsBySegment,
    currentSegmentId,
    currentSegmentIdRef,
  };
}
