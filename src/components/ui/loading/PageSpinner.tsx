import { cn } from '@/lib/utils';

import { Spinner } from './Spinner';

interface PageSpinnerProps extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * Optional loading message to display below spinner
   */
  message?: string;
}

/**
 * PageSpinner - 전체 페이지 로딩 상태를 표시합니다.
 *
 * @example
 * ```tsx
 * // Basic usage
 * if (isLoading) return <PageSpinner />;
 *
 * // With message
 * <PageSpinner message="데이터를 불러오는 중..." />
 * ```
 */
function PageSpinner({ message, className, ...props }: PageSpinnerProps) {
  return (
    <div
      className={cn('page-loading', className)}
      role="status"
      aria-live="polite"
      {...props}
    >
      <Spinner
        size="lg"
        className="text-primary"
      />
      {message && <p className="text-muted-foreground text-sm">{message}</p>}
    </div>
  );
}

export { PageSpinner, type PageSpinnerProps };
