/**
 * Accordion component using Radix UI
 * Shadcn UI pattern implementation
 */
import * as AccordionPrimitive from '@radix-ui/react-accordion';
import { ChevronDown } from 'lucide-react';
import { type ComponentProps } from 'react';

import { cn } from '@/lib/utils';

const Accordion = AccordionPrimitive.Root;

type AccordionItemProps = ComponentProps<typeof AccordionPrimitive.Item>;

function AccordionItem({ className, ...props }: AccordionItemProps) {
  return (
    <AccordionPrimitive.Item
      className={cn('border-border border-b', className)}
      {...props}
    />
  );
}

type AccordionTriggerProps = ComponentProps<typeof AccordionPrimitive.Trigger>;

function AccordionTrigger({
  className,
  children,
  ...props
}: AccordionTriggerProps) {
  return (
    <AccordionPrimitive.Header className="flex">
      <AccordionPrimitive.Trigger
        className={cn(
          'flex flex-1 items-center justify-between py-4 text-sm font-medium transition-all hover:underline [&[data-state=open]>svg]:rotate-180',
          className
        )}
        {...props}
      >
        {children}
        <ChevronDown className="text-muted-foreground size-4 shrink-0 transition-transform duration-200" />
      </AccordionPrimitive.Trigger>
    </AccordionPrimitive.Header>
  );
}

type AccordionContentProps = ComponentProps<typeof AccordionPrimitive.Content>;

function AccordionContent({
  className,
  children,
  ...props
}: AccordionContentProps) {
  return (
    <AccordionPrimitive.Content
      className="data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down overflow-hidden text-sm"
      {...props}
    >
      <div className={cn('pt-0 pb-4', className)}>{children}</div>
    </AccordionPrimitive.Content>
  );
}

export { Accordion, AccordionContent, AccordionItem, AccordionTrigger };
export type {
  AccordionContentProps,
  AccordionItemProps,
  AccordionTriggerProps,
};
