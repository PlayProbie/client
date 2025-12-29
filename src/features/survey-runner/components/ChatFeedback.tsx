/**
 * ChatFeedback - 메시지 피드백 버튼
 * 좋아요/싫어요, 복사 기능
 */

import { ClipboardCopy, ThumbsDown, ThumbsUp } from 'lucide-react';
import { type ComponentProps, useState } from 'react';

import { cn } from '@/lib/utils';

type ChatFeedbackProps = ComponentProps<'div'> & {
  messageContent: string;
  onFeedback?: (type: 'up' | 'down') => void;
};

export function ChatFeedback({
  messageContent,
  onFeedback,
  className,
  ...props
}: ChatFeedbackProps) {
  const [feedback, setFeedback] = useState<'up' | 'down' | null>(null);
  const [copied, setCopied] = useState(false);

  const handleFeedback = (type: 'up' | 'down') => {
    setFeedback(type);
    onFeedback?.(type);
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(messageContent);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  return (
    <div
      className={cn('flex items-center gap-2', className)}
      {...props}
    >
      <button
        type="button"
        onClick={() => handleFeedback('up')}
        className={cn(
          'text-muted-foreground hover:text-foreground flex size-8 items-center justify-center rounded-md transition-colors',
          feedback === 'up' && 'text-success'
        )}
        aria-label="좋아요"
      >
        <ThumbsUp className="size-4" />
      </button>

      <button
        type="button"
        onClick={() => handleFeedback('down')}
        className={cn(
          'text-muted-foreground hover:text-foreground flex size-8 items-center justify-center rounded-md transition-colors',
          feedback === 'down' && 'text-destructive'
        )}
        aria-label="싫어요"
      >
        <ThumbsDown className="size-4" />
      </button>

      <button
        type="button"
        onClick={handleCopy}
        className={cn(
          'text-muted-foreground hover:text-foreground flex size-8 items-center justify-center rounded-md transition-colors',
          copied && 'text-success'
        )}
        aria-label="복사"
      >
        <ClipboardCopy className="size-4" />
      </button>
    </div>
  );
}
