import type { LucideIcon } from 'lucide-react';
import { NavLink } from 'react-router-dom';

import { type NavItem as NavItemType } from '@/config/navigation';
import { cn } from '@/lib/utils';

import {
  NavChildrenList,
  NavItemExpandButton,
  NavItemLink,
} from './NavItemComponents';
import {
  getActiveStyle,
  NAV_ITEM_ACTIVE_STYLES,
  NAV_ITEM_BASE_STYLES,
  NAV_ITEM_INACTIVE_STYLES,
} from './styles';
import { useNavItemState } from './useNavItemState';

// =============================================================================
// Types
// =============================================================================

interface NavItemProps {
  item: NavItemType;
  isCollapsed: boolean;
  activeGameUuid?: string;
  activeSurveyUuid?: string;
}

// =============================================================================
// NavItem with Children (Expandable)
// =============================================================================

interface NavItemWithChildrenProps {
  to: string;
  label: string;
  icon: LucideIcon;
  isCollapsed: boolean;
  activeState: 'exact' | 'partial' | 'none';
  isExpanded: boolean;
  onToggleExpand: () => void;
  resolvedChildren: Array<{ to: string; label: string; resolvedTo: string }>;
}

function NavItemWithChildren({
  to,
  label,
  icon,
  isCollapsed,
  activeState,
  isExpanded,
  onToggleExpand,
  resolvedChildren,
}: NavItemWithChildrenProps) {
  const itemClassName = cn(
    NAV_ITEM_BASE_STYLES,
    isCollapsed && 'justify-center px-2',
    getActiveStyle(activeState)
  );

  return (
    <div className="flex flex-col">
      <div className={itemClassName}>
        <NavItemLink
          to={to}
          label={label}
          icon={icon}
          isCollapsed={isCollapsed}
        />
        {!isCollapsed && (
          <NavItemExpandButton
            isExpanded={isExpanded}
            onToggle={onToggleExpand}
          />
        )}
      </div>

      {!isCollapsed && isExpanded && (
        <NavChildrenList children={resolvedChildren} />
      )}
    </div>
  );
}

// =============================================================================
// NavItem Simple (No Children)
// =============================================================================

interface NavItemSimpleProps {
  to: string;
  label: string;
  icon: LucideIcon;
  isCollapsed: boolean;
}

function NavItemSimple({ to, label, icon, isCollapsed }: NavItemSimpleProps) {
  const IconComponent = icon;
  return (
    <NavLink
      to={to}
      title={isCollapsed ? label : undefined}
      className={({ isActive }) =>
        cn(
          NAV_ITEM_BASE_STYLES,
          isCollapsed && 'justify-center px-2',
          isActive ? NAV_ITEM_ACTIVE_STYLES : NAV_ITEM_INACTIVE_STYLES
        )
      }
    >
      <IconComponent className="size-5 shrink-0 stroke-2 transition-colors" />
      {!isCollapsed && <span className="truncate">{label}</span>}
    </NavLink>
  );
}

// =============================================================================
// NavItem (Main Export)
// =============================================================================

function NavItem({
  item,
  isCollapsed,
  activeGameUuid,
  activeSurveyUuid,
}: NavItemProps) {
  const {
    resolvedPath,
    resolvedChildren,
    activeState,
    isExpanded,
    setIsExpanded,
  } = useNavItemState(item, {
    gameUuid: activeGameUuid,
    surveyUuid: activeSurveyUuid,
  });

  const hasChildren = Boolean(resolvedChildren?.length);

  if (hasChildren && resolvedChildren) {
    return (
      <NavItemWithChildren
        to={resolvedPath}
        label={item.label}
        icon={item.icon}
        isCollapsed={isCollapsed}
        activeState={activeState}
        isExpanded={isExpanded}
        onToggleExpand={() => setIsExpanded((prev) => !prev)}
        resolvedChildren={resolvedChildren}
      />
    );
  }

  return (
    <NavItemSimple
      to={resolvedPath}
      label={item.label}
      icon={item.icon}
      isCollapsed={isCollapsed}
    />
  );
}

export default NavItem;
