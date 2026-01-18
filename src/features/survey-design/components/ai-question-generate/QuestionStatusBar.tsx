import { RefreshCw } from 'lucide-react';

import { Button } from '@/components/ui';
import { cn } from '@/lib/utils';

type QuestionStatusBarProps = {
  selectedCount: number;
  totalCount: number;
  isAllSelected: boolean;
  isRegenerating?: boolean;
  onSelectAll: () => void;
  onDeselectAll: () => void;
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
  onDeselectAll,
  onRegenerate,
}: QuestionStatusBarProps) {
  return (
    <div className="border-border bg-muted/30 flex items-center justify-between rounded-lg border px-4 py-3">
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onSelectAll}
              className="h-7 text-xs px-2"
              disabled={isAllSelected}
            >
              전체 선택
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onDeselectAll}
              className="h-7 text-xs px-2"
              disabled={selectedCount === 0}
            >
              전체 해제
            </Button>
        </div>
        <div className="h-4 w-px bg-border mx-1" />
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
