import { ChevronLeft, ChevronRight, MoreHorizontal } from 'lucide-react';
import { type ComponentProps } from 'react';

import { cn } from '@/lib/utils';

import { buttonVariants } from './button';

function Pagination({ className, ...props }: ComponentProps<'nav'>) {
  return (
    <nav
      role="navigation"
      aria-label="pagination"
      className={cn('mx-auto flex w-full justify-center', className)}
      {...props}
    />
  );
}

function PaginationContent({ className, ...props }: ComponentProps<'ul'>) {
  return (
    <ul
      className={cn('flex flex-row items-center gap-1', className)}
      {...props}
    />
  );
}

function PaginationItem({ className, ...props }: ComponentProps<'li'>) {
  return (
    <li
      className={cn('', className)}
      {...props}
    />
  );
}

type PaginationLinkProps = {
  isActive?: boolean;
} & ComponentProps<'button'>;

function PaginationLink({
  className,
  isActive,
  ...props
}: PaginationLinkProps) {
  return (
    <button
      aria-current={isActive ? 'page' : undefined}
      className={cn(
        buttonVariants({
          variant: isActive ? 'outline' : 'ghost',
          size: 'icon',
        }),
        'size-9',
        className
      )}
      {...props}
    />
  );
}

function PaginationPrevious({ className, ...props }: ComponentProps<'button'>) {
  return (
    <button
      aria-label="이전 페이지"
      className={cn(
        buttonVariants({ variant: 'ghost', size: 'icon' }),
        'size-9',
        className
      )}
      {...props}
    >
      <ChevronLeft className="size-4" />
    </button>
  );
}

function PaginationNext({ className, ...props }: ComponentProps<'button'>) {
  return (
    <button
      aria-label="다음 페이지"
      className={cn(
        buttonVariants({ variant: 'ghost', size: 'icon' }),
        'size-9',
        className
      )}
      {...props}
    >
      <ChevronRight className="size-4" />
    </button>
  );
}

function PaginationEllipsis({ className, ...props }: ComponentProps<'span'>) {
  return (
    <span
      aria-hidden
      className={cn('flex size-9 items-center justify-center', className)}
      {...props}
    >
      <MoreHorizontal className="size-4" />
      <span className="sr-only">More pages</span>
    </span>
  );
}

export {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
};
