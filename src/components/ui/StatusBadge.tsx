/**
 * StatusBadge - 상태 표시용 Badge 컴포넌트
 * 다양한 상태에 대한 일관된 스타일링 제공
 */

import { type ComponentProps } from 'react';

import { cn } from '@/lib/utils';

/** 상태 variant */
export type StatusVariant =
  | 'success'
  | 'info'
  | 'warning'
  | 'destructive'
  | 'muted';

/** variant별 스타일 매핑 */
const STATUS_VARIANT_CLASSES: Record<StatusVariant, string> = {
  success: 'text-success',
  info: 'text-info',
  warning: 'text-warning',
  destructive: 'text-destructive',
  muted: 'text-muted-foreground',
} as const;

type StatusBadgeProps = ComponentProps<'span'> & {
  /** 상태 variant (색상 결정) */
  variant: StatusVariant;
  /** 표시할 라벨 */
  label: string;
};

/**
 * 상태 표시용 Badge 컴포넌트
 * @example
 * <StatusBadge variant="success" label="완료" />
 * <StatusBadge variant="info" label="진행 중" />
 */
function StatusBadge({
  variant,
  label,
  className,
  ...props
}: StatusBadgeProps) {
  return (
    <span
      className={cn(STATUS_VARIANT_CLASSES[variant], className)}
      {...props}
    >
      {label}
    </span>
  );
}

export { StatusBadge };
export type { StatusBadgeProps };
