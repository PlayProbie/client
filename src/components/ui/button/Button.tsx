import { Slot } from '@radix-ui/react-slot';
import { type VariantProps } from 'class-variance-authority';

import { cn } from '@/lib/utils';

import { buttonVariants } from './button-variants';

interface ButtonProps
  extends
    React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  /** Slot 패턴을 사용하여 자식 요소를 버튼으로 렌더링합니다. */
  asChild?: boolean;
}

/**
 * Button - 기본 버튼 컴포넌트
 *
 * @example
 * ```tsx
 * // 기본 사용
 * <Button>Click me</Button>
 *
 * // Variant 적용
 * <Button variant="destructive">Delete</Button>
 * <Button variant="outline">Cancel</Button>
 *
 * // Size 적용
 * <Button size="sm">Small</Button>
 * <Button size="lg">Large</Button>
 *
 * // asChild 패턴 (Link로 렌더링)
 * <Button asChild>
 *   <a href="/link">Go to Link</a>
 * </Button>
 *
 * // 아이콘 버튼
 * <Button variant="ghost" size="icon">
 *   <PlusIcon />
 * </Button>
 * ```
 */
function Button({
  className,
  variant = 'outline',
  size,
  asChild = false,
  ...props
}: ButtonProps) {
  const Comp = asChild ? Slot : 'button';
  return (
    <Comp
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  );
}

export { Button, type ButtonProps };
