import { type VariantProps } from 'class-variance-authority';
import { Check } from 'lucide-react';
import { type ComponentProps } from 'react';

import { cn } from '@/lib/utils';

import { stepSymbolVariants, stepTrailVariants } from './step-variants';

type StepSymbolProps = ComponentProps<'div'> &
  VariantProps<typeof stepSymbolVariants> & {
    stepNumber?: number;
  };

function StepSymbol({
  className,
  state,
  type,
  stepNumber,
  ...props
}: StepSymbolProps) {
  return (
    <div
      className={cn(stepSymbolVariants({ state, type, className }))}
      {...props}
    >
      {type === 'checked' && state === 'completed' ? (
        <Check className="size-4" />
      ) : type === 'bullet' ? (
        <span className="size-2 rounded-full bg-current" />
      ) : (
        <span>{String(stepNumber ?? 1).padStart(2, '0')}</span>
      )}
    </div>
  );
}

type StepTrailProps = ComponentProps<'div'> &
  VariantProps<typeof stepTrailVariants>;

function StepTrail({ className, state, borderType, ...props }: StepTrailProps) {
  return (
    <div
      className={cn(stepTrailVariants({ state, borderType, className }))}
      {...props}
    />
  );
}

type StepItem = {
  label: string;
};

type StepProps = ComponentProps<'div'> & {
  steps: (string | StepItem)[];
  currentStep: number;
  orientation?: 'horizontal' | 'vertical';
  showLabels?: boolean;
};

function Step({
  className,
  steps,
  currentStep,
  orientation = 'horizontal',
  showLabels = true,
  ...props
}: StepProps) {
  const normalizedSteps = steps.map((step) =>
    typeof step === 'string' ? { label: step } : step
  );

  const getStepState = (index: number) => {
    if (index < currentStep) return 'completed';
    if (index === currentStep) return 'active';
    return 'default';
  };

  if (orientation === 'vertical') {
    return (
      <div
        className={cn('flex flex-col gap-2', className)}
        {...props}
      >
        {normalizedSteps.map((step, index) => (
          <div
            key={index}
            className="flex items-start gap-3"
          >
            <div className="flex flex-col items-center">
              <StepSymbol
                state={getStepState(index)}
                type="numbered"
                stepNumber={index + 1}
              />
              {index < normalizedSteps.length - 1 && (
                <StepTrail
                  state={getStepState(index + 1)}
                  className="my-1 h-6 w-0.5"
                />
              )}
            </div>
            {showLabels && (
              <span
                className={cn(
                  'pt-1 text-sm',
                  getStepState(index) === 'active'
                    ? 'text-foreground font-medium'
                    : 'text-muted-foreground'
                )}
              >
                {step.label}
              </span>
            )}
          </div>
        ))}
      </div>
    );
  }

  return (
    <div
      className={cn('flex items-center gap-2', className)}
      {...props}
    >
      {normalizedSteps.map((step, index) => (
        <div
          key={index}
          className="flex flex-1 items-center gap-2"
        >
          <div className="flex flex-col items-center gap-1">
            <StepSymbol
              state={getStepState(index)}
              type="numbered"
              stepNumber={index + 1}
            />
            {showLabels && (
              <span
                className={cn(
                  'text-xs',
                  getStepState(index) === 'active'
                    ? 'text-foreground font-medium'
                    : 'text-muted-foreground'
                )}
              >
                {step.label}
              </span>
            )}
          </div>
          {index < normalizedSteps.length - 1 && (
            <StepTrail
              state={getStepState(index + 1)}
              className="mb-5"
            />
          )}
        </div>
      ))}
    </div>
  );
}

export { Step, StepSymbol, StepTrail };
export type { StepItem, StepProps, StepSymbolProps, StepTrailProps };
