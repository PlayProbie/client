import type { LucideIcon } from 'lucide-react';
import { ChevronDown } from 'lucide-react';
import { Link, NavLink } from 'react-router-dom';

import { Button } from '@/components/ui';
import { cn } from '@/lib/utils';

// =============================================================================
// NavItemLink - 아이콘 + 라벨 링크
// =============================================================================

// =============================================================================
// NavItemLink - 아이콘 + 라벨 링크
// =============================================================================

interface NavItemLinkProps {
  to: string;
  label: string;
  icon: LucideIcon;
  isCollapsed: boolean;
  className?: string;
}

export function NavItemLink({
  to,
  label,
  icon,
  isCollapsed,
  className,
}: NavItemLinkProps) {
  const IconComponent = icon;
  return (
    <Link
      to={to}
      title={isCollapsed ? label : undefined}
      className={cn('flex flex-1 items-center gap-3', className)}
    >
      <IconComponent className="size-5 shrink-0 stroke-2 transition-colors" />
      {!isCollapsed && (
        <span className="flex-1 truncate text-left">{label}</span>
      )}
    </Link>
  );
}

// =============================================================================
// NavItemExpandButton - 접기/펼치기 버튼
// =============================================================================

interface NavItemExpandButtonProps {
  isExpanded: boolean;
  onToggle: () => void;
}

export function NavItemExpandButton({
  isExpanded,
  onToggle,
}: NavItemExpandButtonProps) {
  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      onClick={onToggle}
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
  );
}

// =============================================================================
// NavChildItem - 자식 메뉴 아이템
// =============================================================================

interface NavChildItemProps {
  to: string;
  label: string;
}

export function NavChildItem({ to, label }: NavChildItemProps) {
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
// NavChildrenList - 자식 메뉴 목록
// =============================================================================

interface ResolvedChild {
  to: string;
  label: string;
  resolvedTo: string;
}

interface NavChildrenListProps {
  children: ResolvedChild[];
}

export function NavChildrenList({ children }: NavChildrenListProps) {
  return (
    <div className="border-sidebar-border mt-1 ml-4 flex flex-col gap-0.5 border-l pl-3">
      {children.map((child) => (
        <NavChildItem
          key={child.to}
          to={child.resolvedTo}
          label={child.label}
        />
      ))}
    </div>
  );
}
