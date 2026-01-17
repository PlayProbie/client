import { Navigate, useLocation } from 'react-router-dom';

import { PageSpinner } from '@/components/ui';
import { useAuthStore } from '@/stores';

interface GuestGuardProps {
  children: React.ReactNode;
}

/**
 * GuestGuard - 비인증 사용자만 접근 가능한 경로를 보호합니다.
 * 이미 인증된 사용자는 홈(/)으로 리다이렉트됩니다.
 */
export function GuestGuard({ children }: GuestGuardProps) {
  const { isAuthenticated, isLoading } = useAuthStore();
  const location = useLocation();

  // 인증 상태 로딩 중
  if (isLoading) {
    return <PageSpinner />;
  }

  // 이미 인증된 경우 원래 가려던 경로 또는 홈으로 리다이렉트
  if (isAuthenticated) {
    const from = (location.state as { from?: Location })?.from?.pathname || '/';
    return (
      <Navigate
        to={from}
        replace
      />
    );
  }

  return <>{children}</>;
}
