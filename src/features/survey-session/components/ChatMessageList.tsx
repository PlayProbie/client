/**
 * ChatMessageList - 메시지 목록 컴포넌트
 * 스크롤 가능한 메시지 영역
 */

import { Sparkles } from 'lucide-react';
import { type ComponentProps, useEffect, useRef } from 'react';

import { cn } from '@/lib/utils';

import type { ChatMessageData } from '../types';
import { ChatMessage } from './ChatMessage';

type ChatMessageListProps = ComponentProps<'div'> & {
  messages: ChatMessageData[];
  isLoading?: boolean;
};

export function ChatMessageList({
  messages,
  isLoading: _isLoading,
  className,
  ...props
}: ChatMessageListProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // 마지막 메시지가 사용자 메시지인지 확인 (AI 응답 대기 중)
  const lastMessage = messages[messages.length - 1];
  const isWaitingForAI = lastMessage?.type === 'user';

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

      {/* AI 타이핑 인디케이터 - 마지막이 사용자 메시지일 때 표시 */}
      {isWaitingForAI && (
        <div className="flex justify-start gap-3">
          <div className="bg-primary/10 text-primary flex size-8 shrink-0 items-center justify-center rounded-full">
            <Sparkles className="size-4" />
          </div>
          <div className="bg-muted flex items-center gap-1 rounded-2xl rounded-tl-none px-4 py-3">
            <span className="bg-foreground/60 size-2 animate-bounce rounded-full [animation-delay:0ms]" />
            <span className="bg-foreground/60 size-2 animate-bounce rounded-full [animation-delay:150ms]" />
            <span className="bg-foreground/60 size-2 animate-bounce rounded-full [animation-delay:300ms]" />
          </div>
        </div>
      )}

      {/* 스크롤 앵커 */}
      <div ref={messagesEndRef} />
    </div>
  );
}
