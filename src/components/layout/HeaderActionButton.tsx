/**
 * HeaderActionButton - Header 영역 액션 버튼 컴포넌트
 * 아이콘 기반의 일관된 액션 버튼 스타일 제공
 */

import { type ComponentProps, type ReactNode } from 'react';

import { cn } from '@/lib/utils';

type HeaderActionButtonProps = Omit<ComponentProps<'button'>, 'children'> & {
  /** 버튼 아이콘 */
  icon: ReactNode;
  /** 접근성 라벨 */
  label: string;
  /** 원형 variant (프로필 버튼 등) */
  rounded?: boolean;
};

/**
 * Header 영역 액션 버튼
 * @example
 * <HeaderActionButton icon={<Search className="size-5" />} label="검색" />
 * <HeaderActionButton icon={<User className="size-5" />} label="프로필" rounded />
 */
function HeaderActionButton({
  icon,
  label,
  rounded = false,
  className,
  ...props
}: HeaderActionButtonProps) {
  return (
    <button
      type="button"
      className={cn(
        'flex size-9 items-center justify-center transition-colors',
        'text-muted-foreground hover:bg-accent hover:text-accent-foreground',
        rounded ? 'bg-muted rounded-full' : 'rounded-md',
        className
      )}
      aria-label={label}
      {...props}
    >
      {icon}
    </button>
  );
}

export { HeaderActionButton };
export type { HeaderActionButtonProps };
