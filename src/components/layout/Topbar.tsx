import { useLocation } from 'react-router-dom';

import { findNavItemByPath } from '@/config/navigation';

import {
  BreadcrumbNav,
  NotificationButton,
  WorkspaceSelector,
} from './topbar-components';

function Topbar() {
  const location = useLocation();
  const { breadcrumbs } = findNavItemByPath(location.pathname);

  return (
    <header
      id="app-topbar"
      className="border-border bg-background/80 sticky top-0 z-10 flex items-center justify-between border-b px-8 py-4 backdrop-blur-md"
    >
      <BreadcrumbNav breadcrumbs={breadcrumbs} />

      <div className="flex items-center gap-6">
        <WorkspaceSelector />
        <NotificationButton />
      </div>
    </header>
  );
}

export default Topbar;
