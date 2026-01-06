import { useParams } from 'react-router-dom';

import { ScrollArea } from '@/components/ui/ScrollArea';
import { NAV_ITEMS } from '@/config/navigation';
import { useGamesQuery } from '@/features/game-streaming';

import NavItem from './NavItem';

interface SidebarNavProps {
  isCollapsed: boolean;
}

function SidebarNav({ isCollapsed }: SidebarNavProps) {
  const { gameUuid: routeGameUuid } = useParams<{ gameUuid?: string }>();
  const { data: games } = useGamesQuery();
  const fallbackGameUuid = games?.[0]?.gameUuid;
  const activeGameUuid = routeGameUuid ?? fallbackGameUuid;

  return (
    <ScrollArea className="flex-1 overflow-hidden">
      <div className="px-4 py-4">
        <nav className="flex flex-col gap-1">
          {NAV_ITEMS.map((item) => (
            <NavItem
              key={item.to}
              item={item}
              isCollapsed={isCollapsed}
              activeGameUuid={activeGameUuid}
            />
          ))}
        </nav>
      </div>
    </ScrollArea>
  );
}

export default SidebarNav;
