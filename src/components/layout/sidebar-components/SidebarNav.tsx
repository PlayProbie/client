import { useParams } from 'react-router-dom';

import { ScrollArea } from '@/components/ui/ScrollArea';
import { NAV_ITEMS } from '@/config/navigation';
import { useGamesQuery } from '@/features/game-streaming';

import NavItem from './NavItem';

interface SidebarNavProps {
  isCollapsed: boolean;
}

/** UUID가 유효한지 확인 (route placeholder가 아닌지) */
const isValidUuid = (uuid?: string): boolean => {
  if (!uuid) return false;
  // ':gameUuid', ':surveyUuid' 같은 route placeholder는 무효
  if (uuid.startsWith(':')) return false;
  return true;
};

function SidebarNav({ isCollapsed }: SidebarNavProps) {
  const { gameUuid: routeGameUuid, surveyUuid: routeSurveyUuid } = useParams<{
    gameUuid?: string;
    surveyUuid?: string;
  }>();
  const { data: games } = useGamesQuery();
  const fallbackGameUuid = games?.[0]?.gameUuid;

  // route param이 유효한 UUID가 아니면 fallback 사용
  const validRouteGameUuid = isValidUuid(routeGameUuid)
    ? routeGameUuid
    : undefined;
  const activeGameUuid = validRouteGameUuid ?? fallbackGameUuid;

  // surveyUuid도 유효성 검사
  const activeSurveyUuid = isValidUuid(routeSurveyUuid)
    ? routeSurveyUuid
    : undefined;

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
              activeSurveyUuid={activeSurveyUuid}
            />
          ))}
        </nav>
      </div>
    </ScrollArea>
  );
}

export default SidebarNav;
