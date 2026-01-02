import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '@/lib/utils';

const spinnerVariants = cva(
  'animate-spin rounded-full border-current border-t-transparent',
  {
    variants: {
      size: {
        sm: 'size-4 border-2',
        md: 'size-6 border-2',
        lg: 'size-8 border-4',
      },
    },
    defaultVariants: {
      size: 'md',
    },
  }
);

interface SpinnerProps
  extends
    React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof spinnerVariants> {}

/**
 * Spinner - 인라인 로딩 상태를 표시하는 스피너입니다.
 *
 * @example
 * ```tsx
 * // Basic usage
 * <Spinner />
 *
 * // With size variants
 * <Spinner size="sm" />
 * <Spinner size="lg" />
 *
 * // With custom color
 * <Spinner className="text-primary" />
 * ```
 */
function Spinner({ size, className, ...props }: SpinnerProps) {
  return (
    <div
      className={cn(spinnerVariants({ size }), className)}
      role="status"
      aria-label="로딩 중"
      {...props}
    />
  );
}

export { Spinner, type SpinnerProps };
