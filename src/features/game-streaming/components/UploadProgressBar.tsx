/**
 * UploadProgressBar - 업로드 진행률 표시
 * percent/speed/eta/transferred 표시
 */
import { cn } from '@/lib/utils';

import type { UploadProgress } from '../types';
import { formatBytes, formatTime } from '../utils';

interface UploadProgressBarProps {
  progress: UploadProgress;
  className?: string;
}

export function UploadProgressBar({
  progress,
  className,
}: UploadProgressBarProps) {
  const { percent, uploaded, total, speed, eta } = progress;

  return (
    <div className={cn('space-y-2', className)}>
      {/* Progress Bar */}
      <div className="bg-muted relative h-3 w-full overflow-hidden rounded-full">
        <div
          className="bg-primary h-full transition-all duration-300 ease-out"
          style={{ width: `${percent}%` }}
        />
      </div>

      {/* Stats */}
      <div className="text-muted-foreground flex items-center justify-between text-xs">
        <div className="flex items-center gap-3">
          {/* Percent */}
          <span className="text-foreground font-medium">{percent}%</span>

          {/* Transferred */}
          <span>
            {formatBytes(uploaded)} / {formatBytes(total)}
          </span>
        </div>

        <div className="flex items-center gap-3">
          {/* Speed */}
          <span>{formatBytes(speed)}/s</span>

          {/* ETA */}
          {eta > 0 && <span>남은 시간: {formatTime(eta)}</span>}
        </div>
      </div>
    </div>
  );
}
