import CollapseToggle from './CollapseToggle';
import UserProfile from './UserProfile';

interface SidebarFooterProps {
  isCollapsed: boolean;
  onToggle: () => void;
}

function SidebarFooter({ isCollapsed, onToggle }: SidebarFooterProps) {
  return (
    <div className="border-sidebar-border flex shrink-0 flex-col gap-3 border-t p-4">
      <UserProfile isCollapsed={isCollapsed} />
      <CollapseToggle
        isCollapsed={isCollapsed}
        onToggle={onToggle}
      />
    </div>
  );
}

export default SidebarFooter;
