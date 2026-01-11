import { useSettingStore } from '@/stores';

import SettingsModal from '../SettingsModal';
import CollapseToggle from './CollapseToggle';
import UserProfile from './UserProfile';

interface SidebarFooterProps {
  isCollapsed: boolean;
  onToggle: () => void;
}

function SidebarFooter({ isCollapsed, onToggle }: SidebarFooterProps) {
  const { openSettings } = useSettingStore();

  return (
    <>
      <div className="border-sidebar-border flex shrink-0 flex-col gap-3 border-t p-4">
        <UserProfile
          isCollapsed={isCollapsed}
          onSettingsClick={openSettings}
        />
        <CollapseToggle
          isCollapsed={isCollapsed}
          onToggle={onToggle}
        />
      </div>

      <SettingsModal />
    </>
  );
}

export default SidebarFooter;
