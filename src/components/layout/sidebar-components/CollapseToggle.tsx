import { ChevronLeft, ChevronRight } from 'lucide-react';

import { Button } from '@/components/ui';
import { cn } from '@/lib/utils';

interface CollapseToggleProps {
  isCollapsed: boolean;
  onToggle: () => void;
}

function CollapseToggle({ isCollapsed, onToggle }: CollapseToggleProps) {
  return (
    <Button
      type="button"
      variant="ghost"
      onClick={onToggle}
      className={cn(
        'w-full justify-start gap-2',
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
    </Button>
  );
}

export default CollapseToggle;
