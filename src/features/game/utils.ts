/**
 * Game Utils - 유틸리티 함수
 */

/** 빌드 상태에 따른 CSS 클래스 반환 */
export function getBuildStatusClass(status: string): string {
  switch (status) {
    case 'READY':
      return 'text-success';
    case 'FAILED':
      return 'text-destructive';
    default:
      return 'text-muted-foreground';
  }
}
