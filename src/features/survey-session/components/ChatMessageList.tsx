/**
 * ChatMessageList - 메시지 목록 컴포넌트
 * 스크롤 가능한 메시지 영역
 */

import { type ComponentProps, useEffect, useRef } from 'react';

import { Spinner } from '@/components/ui/loading';
import { cn } from '@/lib/utils';

import type { ChatMessageData } from '../types';
import { ChatMessage } from './ChatMessage';

type ChatMessageListProps = ComponentProps<'div'> & {
  messages: ChatMessageData[];
  isLoading?: boolean;
};

export function ChatMessageList({
  messages,
  isLoading,
  className,
  ...props
}: ChatMessageListProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // 새 메시지 시 자동 스크롤
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <div
      className={cn(
        'flex flex-1 flex-col gap-4 overflow-y-auto px-4 py-6',
        className
      )}
      {...props}
    >
      {messages.map((message) => (
        <ChatMessage
          key={message.id}
          message={message}
        />
      ))}

      {/* 로딩 인디케이터 */}
      {isLoading && (
        <div className="flex justify-start gap-3">
          <div className="bg-primary/10 text-primary flex size-8 shrink-0 items-center justify-center rounded-full">
            <Spinner size="sm" />
          </div>
          <div className="bg-muted flex items-center gap-2 rounded-2xl rounded-tl-none px-4 py-3">
            <Spinner size="sm" />
            <span className="text-muted-foreground text-sm">
              응답 대기 중...
            </span>
          </div>
        </div>
      )}

      {/* 스크롤 앵커 */}
      <div ref={messagesEndRef} />
    </div>
  );
}
