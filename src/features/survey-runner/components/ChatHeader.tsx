/**
 * ChatHeader - 채팅 페이지 상단 헤더
 * Figma 디자인 기반 모바일 최적화
 */

import { type ComponentProps } from 'react';

import { cn } from '@/lib/utils';

type ChatHeaderProps = ComponentProps<'header'>;

export function ChatHeader({ className, ...props }: ChatHeaderProps) {
  return (
    <header
      className={cn(
        'bg-card border-border sticky top-0 z-50 flex items-center justify-center border-b px-4 py-4',
        className
      )}
      {...props}
    >
      <div className="flex items-center justify-center py-2">
        <h1
          className="text-foreground/80 text-2xl font-bold"
          style={{
            fontFamily: "'Shantell Sans', sans-serif",
          }}
        >
          PlayProbie
        </h1>
      </div>
    </header>
  );
}
