/**
 * ChatInput - 메시지 입력 영역
 * Figma 디자인 기반 모바일 최적화
 */

import { Mic, Paperclip, Send } from 'lucide-react';
import { type ComponentProps, type FormEvent, useState } from 'react';

import { cn } from '@/lib/utils';

type ChatInputProps = ComponentProps<'div'> & {
  onSend: (message: string) => void;
  disabled?: boolean;
  placeholder?: string;
};

export function ChatInput({
  onSend,
  disabled = false,
  placeholder = '메시지를 입력하세요...',
  className,
  ...props
}: ChatInputProps) {
  const [message, setMessage] = useState('');

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!message.trim() || disabled) return;

    onSend(message.trim());
    setMessage('');
  };

  return (
    <div
      className={cn(
        'bg-card border-border sticky bottom-0 border-t px-4 py-3',
        className
      )}
      {...props}
    >
      <form
        onSubmit={handleSubmit}
        className="flex items-center gap-2"
      >
        {/* 첨부 버튼 (UI only) */}
        <button
          type="button"
          className="text-muted-foreground hover:text-foreground flex size-10 items-center justify-center rounded-full transition-colors"
          aria-label="첨부"
          disabled={disabled}
        >
          <Paperclip className="size-5" />
        </button>

        {/* 입력 필드 */}
        <div className="border-input bg-background flex flex-1 items-center gap-2 rounded-full border px-4 py-2">
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder={placeholder}
            disabled={disabled}
            className="placeholder:text-muted-foreground flex-1 bg-transparent text-sm outline-none disabled:cursor-not-allowed"
          />

          {/* 마이크 버튼 (UI only) */}
          <button
            type="button"
            className="text-muted-foreground hover:text-foreground transition-colors"
            aria-label="음성 입력"
            disabled={disabled}
          >
            <Mic className="size-5" />
          </button>

          {/* 전송 버튼 */}
          <button
            type="submit"
            disabled={!message.trim() || disabled}
            className={cn(
              'flex size-8 items-center justify-center rounded-xl transition-colors',
              message.trim() && !disabled
                ? 'bg-foreground text-background'
                : 'bg-muted text-muted-foreground'
            )}
            aria-label="전송"
          >
            <Send className="size-4" />
          </button>
        </div>
      </form>

      {/* 완료 상태 메시지 */}
      {disabled && (
        <p className="text-muted-foreground mt-2 text-center text-xs">
          설문이 완료되었습니다. 감사합니다!
        </p>
      )}
    </div>
  );
}
