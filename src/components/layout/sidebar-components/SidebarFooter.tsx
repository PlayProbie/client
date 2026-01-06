import { useState } from 'react';

import SettingsModal from '../SettingsModal';
import CollapseToggle from './CollapseToggle';
import UserProfile from './UserProfile';

interface SidebarFooterProps {
  isCollapsed: boolean;
  onToggle: () => void;
}

function SidebarFooter({ isCollapsed, onToggle }: SidebarFooterProps) {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  return (
    <>
      <div className="border-sidebar-border flex shrink-0 flex-col gap-3 border-t p-4">
        <UserProfile
          isCollapsed={isCollapsed}
          onSettingsClick={() => setIsSettingsOpen(true)}
        />
        <CollapseToggle
          isCollapsed={isCollapsed}
          onToggle={onToggle}
        />
      </div>

      <SettingsModal
        open={isSettingsOpen}
        onOpenChange={setIsSettingsOpen}
      />
    </>
  );
}

export default SidebarFooter;
