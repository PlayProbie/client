import { RefreshCw } from 'lucide-react';

import { Button } from '@/components/ui';
import { cn } from '@/lib/utils';

type QuestionStatusBarProps = {
  selectedCount: number;
  totalCount: number;
  isAllSelected: boolean;
  isRegenerating?: boolean;
  onSelectAll: () => void;
  onRegenerate?: () => void;
};

/**
 * 질문 선택 상태바 및 액션 버튼
 */
function QuestionStatusBar({
  selectedCount,
  totalCount,
  isAllSelected,
  isRegenerating = false,
  onSelectAll,
  onRegenerate,
}: QuestionStatusBarProps) {
  return (
    <div className="border-border bg-muted/30 flex items-center justify-between rounded-lg border px-4 py-3">
      <div className="flex items-center gap-3">
        <Button
          type="button"
          variant="link"
          size="sm"
          onClick={onSelectAll}
          className="h-auto p-0"
        >
          {isAllSelected ? '전체 해제' : '전체 선택'}
        </Button>
        <span className="text-muted-foreground text-sm">
          <span className="text-foreground font-medium">{selectedCount}</span>/
          {totalCount} 선택됨
        </span>
      </div>
      {onRegenerate && (
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={onRegenerate}
          disabled={isRegenerating}
          className="gap-1.5"
        >
          <RefreshCw
            className={cn('size-4', isRegenerating && 'animate-spin')}
          />
          {isRegenerating ? '생성 중...' : '다시 생성하기'}
        </Button>
      )}
    </div>
  );
}

export { QuestionStatusBar };
export type { QuestionStatusBarProps };
