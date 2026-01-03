import type { SurveySessionStatus } from '../types';

/** 세션 상태 상수 */
export const SESSION_STATUS = {
  IN_PROGRESS: 'IN_PROGRESS',
  COMPLETED: 'COMPLETED',
  DROPPED: 'DROPPED',
} as const;

/** 세션 상태별 레이블 */
export const SESSION_STATUS_LABELS: Record<SurveySessionStatus, string> = {
  IN_PROGRESS: '진행 중',
  COMPLETED: '완료',
  DROPPED: '중단',
};

/** 세션 상태 레이블 반환 */
export function getSessionStatusLabel(status: SurveySessionStatus): string {
  return SESSION_STATUS_LABELS[status] || status;
}

/** 세션 상태별 CSS 클래스 반환 */
export function getSessionStatusClassName(status: SurveySessionStatus): string {
  switch (status) {
    case 'COMPLETED':
      return 'text-success';
    case 'IN_PROGRESS':
      return 'text-warning';
    case 'DROPPED':
      return 'text-destructive';
    default:
      return 'text-muted-foreground';
  }
}
