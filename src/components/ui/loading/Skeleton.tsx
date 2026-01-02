import { cn } from '@/lib/utils';

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * Whether to use shimmer effect instead of pulse
   * @default false
   */
  shimmer?: boolean;
}

/**
 * Skeleton - 콘텐츠 로딩 시 플레이스홀더를 표시합니다.
 *
 * @example
 * ```tsx
 * // Basic usage
 * <Skeleton className="h-4 w-[200px]" />
 *
 * // With shimmer effect
 * <Skeleton shimmer className="h-12 w-full" />
 *
 * // Card skeleton
 * <div className="space-y-2">
 *   <Skeleton className="h-4 w-3/4" />
 *   <Skeleton className="h-4 w-1/2" />
 * </div>
 * ```
 */
function Skeleton({ className, shimmer = false, ...props }: SkeletonProps) {
  return (
    <div
      className={cn(
        shimmer ? 'skeleton-shimmer' : 'skeleton',
        'rounded-md',
        className
      )}
      aria-hidden="true"
      {...props}
    />
  );
}

export { Skeleton, type SkeletonProps };
