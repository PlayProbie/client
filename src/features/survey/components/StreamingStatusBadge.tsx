import type { ComponentProps } from 'react';

import { StatusBadge, type StatusVariant } from '@/components/ui/StatusBadge';
import type { StreamingResourceStatus } from '@/features/game-streaming-survey';
import { cn } from '@/lib/utils';

const STREAMING_STATUS_CONFIG: Record<
  StreamingResourceStatus,
  { label: string; variant: StatusVariant }
> = {
  CREATING: { label: '생성 중', variant: 'info' },
  PENDING: { label: '대기 중', variant: 'warning' },
  PROVISIONING: { label: '프로비저닝', variant: 'info' },
  READY: { label: '준비 완료', variant: 'success' },
  TESTING: { label: '테스트 중', variant: 'info' },
  SCALING: { label: '확장 중', variant: 'warning' },
  ACTIVE: { label: '운영 중', variant: 'success' },
  CLEANING: { label: '정리 중', variant: 'warning' },
  TERMINATED: { label: '종료됨', variant: 'muted' },
};

type StreamingStatusBadgeProps = ComponentProps<'span'> & {
  status: StreamingResourceStatus;
};

export function StreamingStatusBadge({
  status,
  className,
  ...props
}: StreamingStatusBadgeProps) {
  const config = STREAMING_STATUS_CONFIG[status];

  return (
    <StatusBadge
      variant={config.variant}
      label={config.label}
      className={cn(
        'inline-flex items-center rounded-full bg-current/10 px-2.5 py-0.5 text-xs font-medium',
        className
      )}
      {...props}
    />
  );
}
