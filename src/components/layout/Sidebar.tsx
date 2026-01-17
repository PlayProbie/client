import { useState } from 'react';

import { cn } from '@/lib/utils';

import {
  SidebarContext,
  SidebarFooter,
  SidebarHeader,
  SidebarNav,
} from './sidebar-components';

function Sidebar() {
  const [isCollapsed, setIsCollapsed] = useState(false);

  const handleToggle = () => setIsCollapsed((prev) => !prev);

  return (
    <SidebarContext.Provider value={{ isCollapsed, toggle: handleToggle }}>
      <aside
        id="app-sidebar"
        className={cn(
          'border-sidebar-border bg-sidebar relative z-20 flex h-full shrink-0 flex-col border-r shadow-sm transition-all duration-300',
          isCollapsed ? 'w-[72px]' : 'w-72'
        )}
      >
        <SidebarHeader isCollapsed={isCollapsed} />
        <SidebarNav isCollapsed={isCollapsed} />
        <SidebarFooter
          isCollapsed={isCollapsed}
          onToggle={handleToggle}
        />
      </aside>
    </SidebarContext.Provider>
  );
}

export default Sidebar;
