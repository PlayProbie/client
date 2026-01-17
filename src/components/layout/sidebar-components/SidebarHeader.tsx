import { Link } from 'react-router-dom';

import { cn } from '@/lib/utils';

interface SidebarHeaderProps {
  isCollapsed: boolean;
}

function SidebarHeader({ isCollapsed }: SidebarHeaderProps) {
  return (
    <div className="shrink-0 p-4 pb-0">
      <Link
        to="/"
        className={cn(
          'flex items-center gap-3 px-2 py-1',
          isCollapsed && 'justify-center px-0'
        )}
      >
        <img
          src="/logo.png"
          alt="PlayProbie"
          className="size-10 shrink-0 rounded-lg"
        />
        {!isCollapsed && (
          <h1 className="text-sidebar-foreground truncate text-lg leading-none font-bold tracking-tight">
            PlayProbie
          </h1>
        )}
      </Link>
    </div>
  );
}

export default SidebarHeader;
