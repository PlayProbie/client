import { cn } from '@/lib/utils';

import { Skeleton } from './Skeleton';

interface TableSkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * Number of columns to render
   * @default 4
   */
  columns?: number;
  /**
   * Number of rows to render
   * @default 5
   */
  rows?: number;
  /**
   * Whether to show header skeleton
   * @default true
   */
  showHeader?: boolean;
}

/**
 * TableSkeleton - 테이블 데이터 로딩 시 스켈레톤을 표시합니다.
 *
 * @example
 * ```tsx
 * // Basic usage
 * if (isLoading) return <TableSkeleton />;
 *
 * // Custom columns and rows
 * <TableSkeleton columns={6} rows={10} />
 *
 * // Without header
 * <TableSkeleton showHeader={false} rows={3} />
 * ```
 */
function TableSkeleton({
  columns = 4,
  rows = 5,
  showHeader = true,
  className,
  ...props
}: TableSkeletonProps) {
  return (
    <div
      className={cn('w-full space-y-3', className)}
      role="status"
      aria-label="테이블 로딩 중"
      {...props}
    >
      {/* Header */}
      {showHeader && (
        <div className="border-border flex gap-4 border-b pb-3">
          {Array.from({ length: columns }).map((_, i) => (
            <Skeleton
              key={`header-${i}`}
              className="h-6 flex-1"
            />
          ))}
        </div>
      )}
      {/* Rows */}
      {Array.from({ length: rows }).map((_, rowIdx) => (
        <div
          key={`row-${rowIdx}`}
          className="flex gap-4"
        >
          {Array.from({ length: columns }).map((_, colIdx) => (
            <Skeleton
              key={`cell-${rowIdx}-${colIdx}`}
              className="h-10 flex-1"
            />
          ))}
        </div>
      ))}
    </div>
  );
}

export { TableSkeleton, type TableSkeletonProps };
