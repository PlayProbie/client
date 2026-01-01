import { Spinner } from './Spinner';

interface ButtonLoadingProps {
  /**
   * Whether button is in loading state
   * @default false
   */
  isLoading?: boolean;
  /**
   * Text to display while loading
   * @default "로딩 중..."
   */
  loadingText?: string;
  /**
   * Button content when not loading
   */
  children: React.ReactNode;
}

/**
 * ButtonLoading - 버튼 내부 로딩 상태를 표시합니다.
 *
 * @example
 * ```tsx
 * <button disabled={isLoading}>
 *   <ButtonLoading isLoading={isLoading} loadingText="저장 중...">
 *     저장
 *   </ButtonLoading>
 * </button>
 *
 * // With custom loading text
 * <button disabled={isPending}>
 *   <ButtonLoading isLoading={isPending} loadingText="제출 중...">
 *     제출하기
 *   </ButtonLoading>
 * </button>
 * ```
 */
function ButtonLoading({
  isLoading = false,
  loadingText = '로딩 중...',
  children,
}: ButtonLoadingProps) {
  if (isLoading) {
    return (
      <span className="inline-flex items-center gap-2">
        <Spinner size="sm" />
        <span>{loadingText}</span>
      </span>
    );
  }

  return <>{children}</>;
}

export { ButtonLoading, type ButtonLoadingProps };
