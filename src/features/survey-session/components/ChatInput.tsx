/**
 * ChatInput - 메시지 입력 영역
 * Figma 디자인 기반 모바일 최적화
 */

import { Mic, Paperclip, Send } from 'lucide-react';
import { type ComponentProps, type FormEvent, useState } from 'react';

import { Button } from '@/components/ui';
import { Input } from '@/components/ui/Input';
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
        <Button
          type="button"
          variant="ghost"
          size="icon"
          aria-label="첨부"
          disabled={disabled}
          className="size-10 rounded-full"
        >
          <Paperclip className="size-5" />
        </Button>

        {/* 입력 필드 */}
        <div className="border-input bg-background flex flex-1 items-center gap-2 rounded-full border px-4 py-2">
          <Input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder={placeholder}
            disabled={disabled}
            className="h-auto flex-1 border-0 bg-transparent px-0 py-0 text-sm focus-visible:ring-0 focus-visible:ring-offset-0"
          />

          {/* 마이크 버튼 (UI only) */}
          <Button
            type="button"
            variant="ghost"
            size="icon"
            aria-label="음성 입력"
            disabled={disabled}
            className="size-8"
          >
            <Mic className="size-5" />
          </Button>

          {/* 전송 버튼 */}
          <Button
            type="submit"
            size="icon"
            disabled={!message.trim() || disabled}
            className={cn(
              'size-8 rounded-xl',
              message.trim() && !disabled
                ? 'bg-foreground text-background hover:bg-foreground/90'
                : 'bg-muted text-muted-foreground'
            )}
            aria-label="전송"
          >
            <Send className="size-4" />
          </Button>
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
