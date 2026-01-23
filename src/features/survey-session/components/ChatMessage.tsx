/**
 * ChatMessage - 채팅 메시지 버블 컴포넌트
 * AI/사용자 메시지 스타일 분리
 */

import { Play, Sparkles, User } from 'lucide-react';
import { type ComponentProps, useState } from 'react';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

import { useChatStore } from '../store/useChatStore';
import type { ChatMessageData } from '../types';
import { ChatFeedback } from './ChatFeedback';
import { ReplayOverlay } from './ReplayOverlay';

type ChatMessageProps = ComponentProps<'div'> & {
  message: ChatMessageData;
};

export function ChatMessage({
  message,
  className,
  ...props
}: ChatMessageProps) {
  const isAI = message.type === 'ai';
  // 스트리밍 중인 메시지 감지 (id가 'ai-streaming-'으로 시작)
  const isStreaming = message.id.startsWith('ai-streaming-');
  // 인사이트 질문 여부
  const isInsightQuestion =
    message.qType === 'INSIGHT' && message.insightQuestion;
  // 리플레이 오버레이 표시 상태
  const [showReplay, setShowReplay] = useState(false);
  const insightTagId = message.insightQuestion?.tagId ?? null;
  const replayPreload = useChatStore((state) =>
    insightTagId !== null ? state.replayPreloads[insightTagId] : undefined
  );

  // 내용이 없는 AI 메시지는 렌더링하지 않음 (타이핑 인디케이터는 ChatMessageList에서 표시)
  if (isAI && !message.content) {
    return null;
  }

  return (
    <>
      <div
        className={cn(
          'flex w-full gap-3',
          isAI ? 'justify-start' : 'justify-end',
          className
        )}
        {...props}
      >
        {/* AI 프로필 아이콘 */}
        {isAI && (
          <div className="bg-primary/10 text-primary flex size-8 shrink-0 items-center justify-center rounded-full">
            <Sparkles className="size-4" />
          </div>
        )}

        {/* 메시지 + 피드백 컨테이너 */}
        <div
          className={cn(
            'flex max-w-[80%] flex-col',
            isAI ? 'items-start' : 'items-end'
          )}
        >
          {/* 메시지 버블 */}
          <div
            className={cn(
              'rounded-2xl px-4 py-3',
              isAI
                ? 'bg-muted text-foreground rounded-tl-none'
                : 'bg-foreground text-background rounded-tr-none'
            )}
          >
            <p className="text-sm leading-relaxed whitespace-pre-wrap">
              {message.content}
            </p>

            {/* 인사이트 질문일 경우 장면 다시보기 버튼 */}
            {isInsightQuestion && !isStreaming && (
              <Button
                variant="outline"
                size="sm"
                className="mt-3 gap-1.5"
                onClick={() => setShowReplay(true)}
              >
                <Play className="size-3" />
                장면 다시보기
              </Button>
            )}
          </div>

          {/* AI 메시지 피드백 버튼 - 스트리밍 중에는 숨김 */}
          {isAI && !isStreaming && (
            <ChatFeedback
              messageContent={message.content}
              className="mt-1 ml-auto"
            />
          )}
        </div>

        {/* 사용자 프로필 아이콘 */}
        {!isAI && (
          <div className="bg-muted text-muted-foreground flex size-8 shrink-0 items-center justify-center rounded-full">
            <User className="size-4" />
          </div>
        )}
      </div>

      {/* 리플레이 오버레이 */}
      {showReplay && message.insightQuestion && (
        <ReplayOverlay
          preloadState={replayPreload}
          onClose={() => setShowReplay(false)}
        />
      )}
    </>
  );
}
