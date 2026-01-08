import { Link } from 'react-router-dom';

import { Button, Skeleton } from '@/components/ui';
import { cn } from '@/lib/utils';

interface GameOverviewCardProps {
  title: string;
  icon: React.ReactNode;
  iconClassName?: string;
  mainValue: React.ReactNode;
  actionUrl: string;
  actionLabel: string;
  isLoading: boolean;
  children: React.ReactNode; // Footer content
}

/**
 * 게임 Overview 페이지 카드 컴포넌트
 */
export function GameOverviewCard({
  title,
  icon,
  iconClassName,
  mainValue,
  actionUrl,
  actionLabel,
  isLoading,
  children,
}: GameOverviewCardProps) {
  return (
    <div className="bg-card rounded-xl border p-6 shadow-sm">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className={cn('rounded-lg p-3', iconClassName)}>{icon}</div>
          <div>
            <p className="text-muted-foreground text-sm">{title}</p>
            {isLoading ? (
              <Skeleton className="mt-1 h-7 w-24" />
            ) : (
              <p className="text-2xl font-bold">{mainValue}</p>
            )}
          </div>
        </div>
        <Button
          variant="outline"
          size="sm"
          asChild
        >
          <Link to={actionUrl}>{actionLabel}</Link>
        </Button>
      </div>
      <div className="mt-4">{children}</div>
    </div>
  );
}
