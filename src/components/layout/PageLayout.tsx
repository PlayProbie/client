import { useEffect } from 'react';

import { useCurrentWorkspaceStore, useSettingStore } from '@/stores';

import Sidebar from './Sidebar';
import Topbar from './Topbar';

interface PageLayoutProps {
  children: React.ReactNode;
}

function PageLayout({ children }: PageLayoutProps) {
  const { currentWorkspace } = useCurrentWorkspaceStore();
  const { openSettings, setActiveTab } = useSettingStore();

  useEffect(() => {
    if (!currentWorkspace) {
      openSettings();
      setActiveTab('workspace');
    }
  }, [currentWorkspace, openSettings, setActiveTab]);

  return (
    <div className="bg-background flex h-screen overflow-hidden">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Topbar - Title is now dynamic based on URL */}
        <Topbar />

        {/* Page Content */}
        <main className="bg-background flex-1 overflow-auto p-6">
          {children}
        </main>
      </div>
    </div>
  );
}

export default PageLayout;
