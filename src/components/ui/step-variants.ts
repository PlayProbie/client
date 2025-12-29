/**
 * Step variants definition
 * Separated for React Refresh compatibility
 */
import { cva } from 'class-variance-authority';

export const stepSymbolVariants = cva(
  'flex size-8 items-center justify-center rounded-full text-sm font-medium transition-colors',
  {
    variants: {
      state: {
        default: 'border-2 border-muted-foreground text-muted-foreground',
        active: 'bg-primary text-primary-foreground',
        completed: 'bg-primary text-primary-foreground',
      },
      type: {
        numbered: '',
        bullet: '',
        checked: '',
      },
    },
    defaultVariants: {
      state: 'default',
      type: 'numbered',
    },
  }
);

export const stepTrailVariants = cva('h-0.5 flex-1 transition-colors', {
  variants: {
    state: {
      default: 'bg-muted-foreground/30',
      active: 'bg-primary',
      completed: 'bg-primary',
    },
    borderType: {
      default: '',
      dotted: 'border-t-2 border-dashed border-muted-foreground bg-transparent',
    },
  },
  defaultVariants: {
    state: 'default',
    borderType: 'default',
  },
});
