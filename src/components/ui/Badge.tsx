import { cva, type VariantProps } from 'class-variance-authority';
import { type ComponentProps, forwardRef } from 'react';

import { cn } from '@/lib/utils';

const badgeVariants = cva( //variant별로 다른 스타일을 관리하는 라이브러리
    'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
    {
        variants: {
            variant: {
                default: 'border-transparent bg-primary text-primary-foreground',
                secondary: 'border-transparent bg-secondary text-secondary-foreground',
                destructive: 'border-transparent bg-destructive text-destructive-foreground',
                outline: 'text-foreground',
            },
        },
        defaultVariants: {
            variant: 'default',
        },
    }
);

interface BadgeProps
    extends ComponentProps<'div'>,
    VariantProps<typeof badgeVariants> { }

const Badge = forwardRef<HTMLDivElement, BadgeProps>( //부모가 이 컴포넌트의 DOM에 직접 접근할 수 있게 해줌
    ({ className, variant, ...props }, ref) => (
        <div
            ref={ref} // 부모가 전달한 ref를 div에 연결
            className={cn(badgeVariants({ variant }), className)}
            {...props}
        />
    )
);
Badge.displayName = 'Badge';

export { Badge };
