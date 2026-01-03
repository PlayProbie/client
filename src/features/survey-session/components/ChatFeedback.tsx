/**
 * ChatFeedback - 메시지 피드백 버튼
 * 좋아요/싫어요, 복사 기능
 * TODO: 좋아요/싫어요 API 연동(컴포넌트 구현만 완료)
 */

import { ClipboardCopy, ThumbsDown, ThumbsUp } from 'lucide-react';
import { type ComponentProps, useState } from 'react';

import { Button } from '@/components/ui';
import { useToast } from '@/hooks/useToast';
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

  const { toast } = useToast();

  const handleFeedback = (type: 'up' | 'down') => {
    setFeedback(type);
    onFeedback?.(type);
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(messageContent);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast({
        variant: 'destructive',
        title: '복사 실패',
        description: '클립보드에 복사하는데 실패했습니다.',
      });
    }
  };

  return (
    <div
      className={cn('flex items-center gap-2', className)}
      {...props}
    >
      <Button
        type="button"
        variant="ghost"
        size="icon"
        onClick={() => handleFeedback('up')}
        className={cn('size-8', feedback === 'up' && 'text-success')}
        aria-label="좋아요"
      >
        <ThumbsUp className="size-4" />
      </Button>

      <Button
        type="button"
        variant="ghost"
        size="icon"
        onClick={() => handleFeedback('down')}
        className={cn('size-8', feedback === 'down' && 'text-destructive')}
        aria-label="싫어요"
      >
        <ThumbsDown className="size-4" />
      </Button>

      <Button
        type="button"
        variant="ghost"
        size="icon"
        onClick={handleCopy}
        className={cn('size-8', copied && 'text-success')}
        aria-label="복사"
      >
        <ClipboardCopy className="size-4" />
      </Button>
    </div>
  );
}
