import { ChevronLeft, ChevronRight } from 'lucide-react';

import { cn } from '@/lib/utils';

interface CollapseToggleProps {
  isCollapsed: boolean;
  onToggle: () => void;
}

function CollapseToggle({ isCollapsed, onToggle }: CollapseToggleProps) {
  return (
    <button
      onClick={onToggle}
      className={cn(
        'text-sidebar-foreground/60 hover:bg-sidebar-accent hover:text-sidebar-foreground flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors',
        isCollapsed && 'justify-center px-2'
      )}
      aria-label={isCollapsed ? '사이드바 펼치기' : '사이드바 접기'}
    >
      {isCollapsed ? (
        <ChevronRight className="size-5 stroke-2" />
      ) : (
        <>
          <ChevronLeft className="size-5 stroke-2" />
          <span>사이드바 접기</span>
        </>
      )}
    </button>
  );
}

export default CollapseToggle;
