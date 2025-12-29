import type * as LabelPrimitive from '@radix-ui/react-label';
import { Slot } from '@radix-ui/react-slot';
import type { ComponentProps, HTMLAttributes } from 'react';
import { useId } from 'react';
import type { ControllerProps, FieldPath, FieldValues } from 'react-hook-form';
import { Controller, FormProvider } from 'react-hook-form';

import { Label } from '@/components/ui/Label';
import { cn } from '@/lib/utils';

import { FormFieldContext, FormItemContext } from './form-context';
import { useFormField } from './use-form-field';

// ============================================================================
// Form (FormProvider wrapper)
// ============================================================================

const Form = FormProvider;

// ============================================================================
// FormField (Controller wrapper)
// ============================================================================

function FormField<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>({ ...props }: ControllerProps<TFieldValues, TName>) {
  return (
    <FormFieldContext.Provider value={{ name: props.name }}>
      <Controller {...props} />
    </FormFieldContext.Provider>
  );
}

// ============================================================================
// FormItem
// ============================================================================

type FormItemProps = HTMLAttributes<HTMLDivElement>;

function FormItem({ className, ...props }: FormItemProps) {
  const id = useId();

  return (
    <FormItemContext.Provider value={{ id }}>
      <div
        className={cn('space-y-2', className)}
        {...props}
      />
    </FormItemContext.Provider>
  );
}

// ============================================================================
// FormLabel
// ============================================================================

type FormLabelProps = ComponentProps<typeof LabelPrimitive.Root>;

function FormLabel({ className, ...props }: FormLabelProps) {
  const { error, formItemId } = useFormField();

  return (
    <Label
      className={cn(error && 'text-destructive', className)}
      htmlFor={formItemId}
      {...props}
    />
  );
}

// ============================================================================
// FormControl
// ============================================================================

type FormControlProps = ComponentProps<typeof Slot>;

function FormControl({ ...props }: FormControlProps) {
  const { error, formItemId, formDescriptionId, formMessageId } =
    useFormField();

  return (
    <Slot
      id={formItemId}
      aria-describedby={
        error ? `${formDescriptionId} ${formMessageId}` : formDescriptionId
      }
      aria-invalid={!!error}
      {...props}
    />
  );
}

// ============================================================================
// FormDescription
// ============================================================================

type FormDescriptionProps = HTMLAttributes<HTMLParagraphElement>;

function FormDescription({ className, ...props }: FormDescriptionProps) {
  const { formDescriptionId } = useFormField();

  return (
    <p
      id={formDescriptionId}
      className={cn('text-muted-foreground text-sm', className)}
      {...props}
    />
  );
}

// ============================================================================
// FormMessage
// ============================================================================

type FormMessageProps = HTMLAttributes<HTMLParagraphElement>;

function FormMessage({ className, children, ...props }: FormMessageProps) {
  const { error, formMessageId } = useFormField();
  const body = error ? String(error?.message ?? '') : children;

  if (!body) {
    return null;
  }

  return (
    <p
      id={formMessageId}
      className={cn('text-destructive text-sm font-medium', className)}
      {...props}
    >
      {body}
    </p>
  );
}

// ============================================================================
// Exports
// ============================================================================

export {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
};
