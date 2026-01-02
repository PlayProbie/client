import { Loader2 } from 'lucide-react';

import { Button, type ButtonProps } from './Button';

interface SubmitButtonProps extends Omit<ButtonProps, 'type' | 'asChild'> {
  /** 폼 제출 중 상태 (true일 경우 로딩 스피너 표시 및 버튼 비활성화) */
  isPending?: boolean;
}

/**
 * SubmitButton - 폼 제출용 버튼
 *
 * React 19 `useActionState`와 함께 사용하여 isPending 상태에서
 * 로딩 스피너를 표시합니다.
 *
 * @example
 * ```tsx
 * // React 19 useActionState와 함께 사용
 * const [state, formAction, isPending] = useActionState(submitAction, initialState);
 *
 * <form action={formAction}>
 *   <SubmitButton isPending={isPending}>Submit</SubmitButton>
 * </form>
 *
 * // 커스텀 스타일 적용
 * <SubmitButton variant="secondary" size="lg" isPending={isPending}>
 *   저장하기
 * </SubmitButton>
 * ```
 */
function SubmitButton({
  isPending = false,
  disabled,
  children,
  variant = 'default',
  ...props
}: SubmitButtonProps) {
  return (
    <Button
      type="submit"
      variant={variant}
      disabled={isPending || disabled}
      {...props}
    >
      {isPending && <Loader2 className="animate-spin" />}
      {children}
    </Button>
  );
}

export { SubmitButton, type SubmitButtonProps };
