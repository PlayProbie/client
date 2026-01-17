/**
 * StatusItemRow - 상태 항목 행 컨테이너
 * 개별 상태 항목을 표시하는 공통 레이아웃
 */
import type { ReactNode } from 'react';

import { cn } from '@/lib/utils';

interface StatusItemRowProps {
  /** 상태 아이콘 */
  icon: ReactNode;
  /** 주 제목 */
  title: string;
  /** 부 제목 (옵션) */
  subtitle?: string;
  /** 액션 버튼들 */
  actions?: ReactNode;
  /** 추가 내용 (Progress bar, 상태 텍스트 등) */
  children?: ReactNode;
  /** 추가 클래스 */
  className?: string;
}

export function StatusItemRow({
  icon,
  title,
  subtitle,
  actions,
  children,
  className,
}: StatusItemRowProps) {
  return (
    <div
      className={cn(
        'border-border space-y-2 border-b p-3 last:border-b-0',
        className
      )}
    >
      {/* Header: 아이콘, 제목, 액션 버튼 */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex min-w-0 flex-1 items-center gap-2">
          {icon}
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium">{title}</p>
            {subtitle && (
              <p className="text-muted-foreground truncate text-xs">
                {subtitle}
              </p>
            )}
          </div>
        </div>

        {/* 액션 버튼 */}
        {actions && (
          <div className="flex shrink-0 items-center gap-1">{actions}</div>
        )}
      </div>

      {/* 추가 내용 */}
      {children}
    </div>
  );
}
