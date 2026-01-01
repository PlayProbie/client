/**
 * Survey Session Status 관련 상수
 * survey-session과 survey-analytics에서 공유
 */

import type { SurveySessionStatus } from '../types';

/** 세션 상태 라벨 (한글) */
export const SESSION_STATUS_LABELS: Record<SurveySessionStatus, string> = {
  COMPLETED: '완료',
  IN_PROGRESS: '진행 중',
  DROPPED: '중단',
} as const;

/** 세션 상태별 Tailwind 클래스 */
export const SESSION_STATUS_CLASSNAMES: Record<SurveySessionStatus, string> = {
  COMPLETED: 'text-success',
  IN_PROGRESS: 'text-info',
  DROPPED: 'text-destructive',
} as const;

/**
 * 세션 상태 라벨 반환
 * @param status - 세션 상태
 * @returns 한글 라벨
 */
export function getSessionStatusLabel(status: SurveySessionStatus): string {
  return SESSION_STATUS_LABELS[status] ?? status;
}

/**
 * 세션 상태별 스타일 클래스 반환
 * @param status - 세션 상태
 * @returns Tailwind 클래스
 */
export function getSessionStatusClassName(status: SurveySessionStatus): string {
  return SESSION_STATUS_CLASSNAMES[status] ?? 'text-muted-foreground';
}
