import { ChevronDown } from 'lucide-react';
import { useState } from 'react';
import { generatePath, Link, NavLink, useLocation } from 'react-router-dom';

import { Button } from '@/components/ui';
import { type NavItem as NavItemType } from '@/config/navigation';
import { cn } from '@/lib/utils';

import {
  NAV_ITEM_ACTIVE_STYLES,
  NAV_ITEM_BASE_STYLES,
  NAV_ITEM_INACTIVE_STYLES,
  NAV_ITEM_PARTIAL_ACTIVE_STYLES,
} from './styles';

const resolveDynamicPath = (path: string, gameUuid?: string) => {
  if (!path.includes(':gameUuid')) {
    return path;
  }

  if (!gameUuid) {
    return path;
  }

  try {
    return generatePath(path, { gameUuid });
  } catch {
    return path;
  }
};

// =============================================================================
// NavChildItem Component
// =============================================================================

interface NavChildItemProps {
  to: string;
  label: string;
}

function NavChildItem({ to, label }: NavChildItemProps) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        cn(
          'rounded-md px-3 py-2 text-sm transition-colors',
          isActive
            ? 'font-medium'
            : 'text-sidebar-foreground/60 hover:bg-sidebar-accent/30 hover:text-sidebar-foreground'
        )
      }
    >
      {label}
    </NavLink>
  );
}

// =============================================================================
// NavItem Component
// =============================================================================

interface NavItemProps {
  item: NavItemType;
  isCollapsed: boolean;
  activeGameUuid?: string;
}

function NavItem({ item, isCollapsed, activeGameUuid }: NavItemProps) {
  const location = useLocation();
  const resolvedItemPath = resolveDynamicPath(item.to, activeGameUuid);
  const resolvedChildren = item.children?.map((child) => ({
    ...child,
    resolvedTo: resolveDynamicPath(child.to, activeGameUuid),
  }));

  const [isExpanded, setIsExpanded] = useState(() => {
    if (location.pathname.startsWith(resolvedItemPath)) return true;
    return (
      resolvedChildren?.some((child) =>
        location.pathname.startsWith(child.resolvedTo)
      ) ?? false
    );
  });

  const Icon = item.icon;
  const hasChildren = Boolean(item.children?.length);

  const isChildActive = resolvedChildren?.some(
    (child) =>
      location.pathname === child.resolvedTo ||
      location.pathname.startsWith(child.resolvedTo + '/')
  );
  const isExactActive = location.pathname === resolvedItemPath;
  const isActive =
    location.pathname === resolvedItemPath ||
    location.pathname.startsWith(resolvedItemPath + '/');

  const handleToggleExpand = () => setIsExpanded((prev) => !prev);

  const getItemClassName = () =>
    cn(
      NAV_ITEM_BASE_STYLES,
      isCollapsed && 'justify-center px-2',
      isExactActive
        ? NAV_ITEM_ACTIVE_STYLES
        : isActive || isChildActive
          ? NAV_ITEM_PARTIAL_ACTIVE_STYLES
          : NAV_ITEM_INACTIVE_STYLES
    );

  if (hasChildren) {
    return (
      <div className="flex flex-col">
        <div className={getItemClassName()}>
          <Link
            to={resolvedItemPath}
            title={isCollapsed ? item.label : undefined}
            className="flex flex-1 items-center gap-3"
          >
            <Icon className="size-5 shrink-0 stroke-2 transition-colors" />
            {!isCollapsed && (
              <span className="flex-1 truncate text-left">{item.label}</span>
            )}
          </Link>
          {!isCollapsed && (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={handleToggleExpand}
              className="size-6"
              aria-label={isExpanded ? '접기' : '펼치기'}
            >
              <ChevronDown
                className={cn(
                  'size-4 shrink-0 stroke-2 transition-transform duration-200',
                  isExpanded && 'rotate-180'
                )}
              />
            </Button>
          )}
        </div>

        {!isCollapsed && isExpanded && (
          <div className="border-sidebar-border mt-1 ml-4 flex flex-col gap-0.5 border-l pl-3">
            {resolvedChildren?.map((child) => (
              <NavChildItem
                key={child.to}
                to={child.resolvedTo}
                label={child.label}
              />
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <NavLink
      to={resolvedItemPath}
      title={isCollapsed ? item.label : undefined}
      className={({ isActive }) =>
        cn(
          NAV_ITEM_BASE_STYLES,
          isCollapsed && 'justify-center px-2',
          isActive ? NAV_ITEM_ACTIVE_STYLES : NAV_ITEM_INACTIVE_STYLES
        )
      }
    >
      <Icon className="size-5 shrink-0 stroke-2 transition-colors" />
      {!isCollapsed && <span className="truncate">{item.label}</span>}
    </NavLink>
  );
}

export default NavItem;
