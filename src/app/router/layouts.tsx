import { Outlet } from 'react-router-dom';

import { AuthGuard, GuestGuard } from '@/components/guards';
import { PageLayout } from '@/components/layout';
import {
  ProvisioningPollingProvider,
  ProvisioningStatusWidget,
  UploadStatusWidget,
} from '@/components/layout/status-widget';
import { Toaster } from '@/components/ui/Toaster';
import { useDeviceCheck } from '@/hooks/useDeviceCheck';
import DesktopOnlyPage from '@/pages/DesktopOnlyPage';

/**
 * RootLayout - 전역 레이아웃 (Toast 등 전역 컴포넌트 포함)
 * - 모바일/태블릿 접속 시 Desktop Only 안내 페이지 표시
 */
export function RootLayout() {
  const { isMobileOrTablet } = useDeviceCheck();

  if (isMobileOrTablet) {
    return <DesktopOnlyPage />;
  }

  return (
    <>
      <Outlet />
      <Toaster />
      <ProvisioningPollingProvider />
      <UploadStatusWidget />
      <ProvisioningStatusWidget />
    </>
  );
}

/**
 * AuthLayout - 인증된 사용자 전용 레이아웃
 */
export function AuthLayout() {
  return (
    <AuthGuard>
      <PageLayout>
        <Outlet />
      </PageLayout>
    </AuthGuard>
  );
}

/**
 * GuestLayout - 비인증 사용자 전용 레이아웃 (로그인 페이지 등)
 */
export function GuestLayout() {
  return (
    <GuestGuard>
      <Outlet />
    </GuestGuard>
  );
}
