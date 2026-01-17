/**
 * Progress - 진행률 표시 컴포넌트
 */
import { cn } from '@/lib/utils';

interface ProgressProps {
  value: number;
  className?: string;
}

export function Progress({ value, className }: ProgressProps) {
  return (
    <div
      className={cn(
        'bg-secondary relative h-2 w-full overflow-hidden rounded-full',
        className
      )}
    >
      <div
        className="bg-primary h-full transition-all duration-300 ease-out"
        style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
      />
    </div>
  );
}
