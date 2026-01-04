/**
 * BuildStatusBadge - 빌드 상태 표시 Badge
 * 공유 StatusBadge 컴포넌트를 활용
 */
import { StatusBadge, type StatusVariant } from '@/components/ui/StatusBadge';
import { cn } from '@/lib/utils';

import type { BuildStatus } from '../types';

interface BuildStatusBadgeProps {
  status: BuildStatus;
  className?: string;
}

const STATUS_CONFIG: Record<
  BuildStatus,
  { label: string; variant: StatusVariant }
> = {
  PENDING: { label: 'Pending', variant: 'warning' },
  UPLOADED: { label: 'Uploaded', variant: 'info' },
  REGISTERING: { label: 'Registering', variant: 'info' },
  READY: { label: 'Ready', variant: 'success' },
  FAILED: { label: 'Failed', variant: 'destructive' },
};

export function BuildStatusBadge({ status, className }: BuildStatusBadgeProps) {
  const config = STATUS_CONFIG[status];

  return (
    <StatusBadge
      variant={config.variant}
      label={config.label}
      className={cn(
        'inline-flex items-center rounded-full bg-current/10 px-2.5 py-0.5 text-xs font-medium',
        className
      )}
    />
  );
}
