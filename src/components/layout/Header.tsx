import { Grid3X3, Menu, Search, User } from 'lucide-react';
import { type ComponentProps } from 'react';

import { cn } from '@/lib/utils';

import { HeaderActionButton } from './HeaderActionButton';

type HeaderProps = ComponentProps<'header'> & {
  logo?: React.ReactNode;
  showSearch?: boolean;
  showAppGrid?: boolean;
  showProfile?: boolean;
  showMenu?: boolean;
  onSearchClick?: () => void;
  onAppGridClick?: () => void;
  onProfileClick?: () => void;
  onMenuClick?: () => void;
};

function Header({
  className,
  logo,
  showSearch = true,
  showAppGrid = true,
  showProfile = true,
  showMenu = true,
  onSearchClick,
  onAppGridClick,
  onProfileClick,
  onMenuClick,
  children,
  ...props
}: HeaderProps) {
  return (
    <header
      className={cn(
        'border-border bg-card sticky top-0 z-50 flex h-14 items-center justify-between border-b px-4',
        className
      )}
      {...props}
    >
      {/* Logo Section */}
      <div className="flex items-center gap-3">
        {logo ?? (
          <div className="bg-primary text-primary-foreground flex size-8 items-center justify-center rounded-md">
            <span className="text-sm font-bold">P</span>
          </div>
        )}
      </div>

      {/* Center Content (children) */}
      {children && <div className="flex-1 px-4">{children}</div>}

      {/* Actions Section */}
      <div className="flex items-center gap-2">
        {showSearch && (
          <HeaderActionButton
            icon={<Search className="size-5" />}
            label="검색"
            onClick={onSearchClick}
          />
        )}
        {showAppGrid && (
          <HeaderActionButton
            icon={<Grid3X3 className="size-5" />}
            label="앱 메뉴"
            onClick={onAppGridClick}
          />
        )}
        {showProfile && (
          <HeaderActionButton
            icon={<User className="size-5" />}
            label="프로필"
            onClick={onProfileClick}
            rounded
          />
        )}
        {showMenu && (
          <HeaderActionButton
            icon={<Menu className="size-5" />}
            label="메뉴"
            onClick={onMenuClick}
          />
        )}
      </div>
    </header>
  );
}

export { Header };
export type { HeaderProps };
