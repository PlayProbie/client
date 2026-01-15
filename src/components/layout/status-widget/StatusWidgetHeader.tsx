/**
 * StatusWidgetHeader - 상태 위젯 헤더
 * 아이콘, 제목, 액션 버튼을 포함하는 공통 헤더
 */
import { ChevronDown, ChevronUp } from 'lucide-react';
import type { ReactNode } from 'react';

import { Button } from '@/components/ui/button';

interface StatusWidgetHeaderProps {
  /** 헤더 아이콘 */
  icon: ReactNode;
  /** 제목 */
  title: string;
  /** 총 항목 수 */
  count: number;
  /** 진행 정보 (옵션) */
  progressInfo?: ReactNode;
  /** 최소화 상태 */
  isMinimized: boolean;
  /** 최소화 토글 */
  onToggleMinimize: () => void;
  /** 추가 액션 표시 여부 */
  showAction?: boolean;
  /** 추가 액션 클릭 핸들러 */
  onAction?: () => void;
  /** 추가 액션 라벨 */
  actionLabel?: string;
  /** 추가 액션 버튼 */
  extraActions?: ReactNode;
}

export function StatusWidgetHeader({
  icon,
  title,
  count,
  progressInfo,
  isMinimized,
  onToggleMinimize,
  showAction,
  onAction,
  actionLabel,
  extraActions,
}: StatusWidgetHeaderProps) {
  return (
    <div className="bg-muted/50 flex items-center justify-between border-b px-4 py-2">
      <div className="flex items-center gap-2">
        {icon}
        <span className="text-sm font-medium">
          {title} ({count}){progressInfo}
        </span>
      </div>

      <div className="flex items-center gap-1">
        {/* 추가 액션 (e.g. 닫기) */}
        {showAction && onAction && actionLabel && (
          <Button
            size="sm"
            variant="ghost"
            className="h-6 px-2 text-xs"
            onClick={onAction}
          >
            {actionLabel}
          </Button>
        )}

        {/* 최소화/최대화 */}
        <Button
          size="icon"
          variant="ghost"
          className="size-6"
          onClick={onToggleMinimize}
        >
          {isMinimized ? (
            <ChevronUp className="size-4" />
          ) : (
            <ChevronDown className="size-4" />
          )}
        </Button>

        {/* 추가 액션 */}
        {extraActions}
      </div>
    </div>
  );
}
