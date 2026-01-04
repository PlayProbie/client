/**
 * 저장되지 않은 변경사항 감지 Hook
 * 탭 이동 시 ConfirmDialog 표시용
 */
import { useCallback, useEffect, useMemo } from 'react';
import { useBlocker } from 'react-router-dom';

export interface UseUnsavedChangesOptions {
  /** 변경사항이 있는지 여부 */
  hasChanges: boolean;
  /** beforeunload 이벤트 메시지 */
  message?: string;
}

export function useUnsavedChanges({
  hasChanges,
  message = '변경사항이 저장되지 않았습니다. 페이지를 떠나시겠습니까?',
}: UseUnsavedChangesOptions) {
  // React Router 네비게이션 차단
  const blocker = useBlocker(
    ({ currentLocation, nextLocation }) =>
      hasChanges && currentLocation.pathname !== nextLocation.pathname
  );

  // blocker 상태에서 직접 dialog 표시 여부 계산 (useState 대신 useMemo)
  const showDialog = useMemo(
    () => blocker.state === 'blocked',
    [blocker.state]
  );

  // 브라우저 beforeunload 이벤트 처리
  useEffect(() => {
    if (!hasChanges) return;

    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = message;
      return message;
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [hasChanges, message]);

  /** 다이얼로그에서 이동 확인 */
  const confirmLeave = useCallback(() => {
    blocker.proceed?.();
  }, [blocker]);

  /** 다이얼로그에서 취소 */
  const cancelLeave = useCallback(() => {
    blocker.reset?.();
  }, [blocker]);

  return {
    showDialog,
    confirmLeave,
    cancelLeave,
    isBlocked: blocker.state === 'blocked',
  };
}
