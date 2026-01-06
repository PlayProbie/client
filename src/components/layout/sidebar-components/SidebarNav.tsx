import { ScrollArea } from '@/components/ui/ScrollArea';
import { NAV_ITEMS } from '@/config/navigation';

import NavItem from './NavItem';

interface SidebarNavProps {
  isCollapsed: boolean;
}

function SidebarNav({ isCollapsed }: SidebarNavProps) {
  return (
    <ScrollArea className="flex-1 overflow-hidden">
      <div className="px-4 py-4">
        <nav className="flex flex-col gap-1">
          {NAV_ITEMS.map((item) => (
            <NavItem
              key={item.to}
              item={item}
              isCollapsed={isCollapsed}
            />
          ))}
        </nav>
      </div>
    </ScrollArea>
  );
}

export default SidebarNav;
