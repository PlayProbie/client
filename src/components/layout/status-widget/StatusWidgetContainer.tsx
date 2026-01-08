/**
 * StatusWidgetContainer - 플로팅 상태 위젯 컨테이너
 * 우측 하단에 고정되는 공통 위젯 컨테이너
 */
import type { ReactNode } from 'react';

import { cn } from '@/lib/utils';

interface StatusWidgetContainerProps {
  /** 위젯 내용 */
  children: ReactNode;
  /** 하단 위치 (bottom-4, bottom-24 등) */
  bottomPosition?: string;
  /** 추가 클래스 */
  className?: string;
}

export function StatusWidgetContainer({
  children,
  bottomPosition = 'bottom-4',
  className,
}: StatusWidgetContainerProps) {
  return (
    <div
      className={cn(
        'bg-background border-border fixed right-4 z-50 w-80 overflow-hidden rounded-lg border shadow-lg',
        bottomPosition,
        className
      )}
    >
      {children}
    </div>
  );
}
