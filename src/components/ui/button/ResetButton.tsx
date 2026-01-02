import { RotateCcw } from 'lucide-react';

import { Button, type ButtonProps } from './Button';

type ResetButtonProps = Omit<ButtonProps, 'type' | 'asChild'>;

/**
 * ResetButton - 폼 초기화용 버튼
 *
 * 기본적으로 `ghost` variant와 RotateCcw 아이콘을 사용합니다.
 *
 * @example
 * ```tsx
 * // 기본 사용
 * <form>
 *   <ResetButton>초기화</ResetButton>
 * </form>
 *
 * // 커스텀 variant 적용
 * <ResetButton variant="outline">Reset</ResetButton>
 * ```
 */
function ResetButton({
  variant = 'ghost',
  children,
  ...props
}: ResetButtonProps) {
  return (
    <Button
      type="reset"
      variant={variant}
      {...props}
    >
      <RotateCcw />
      {children}
    </Button>
  );
}

export { ResetButton, type ResetButtonProps };
