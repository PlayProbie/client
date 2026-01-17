import { CheckCircle, FileEdit, Play } from 'lucide-react';

import type { SurveyStatus } from '@/features/game-streaming-survey/types';
import { cn } from '@/lib/utils';

interface SurveyStatusStepProps {
  status: SurveyStatus;
}

export function SurveyStatusStep({ status }: SurveyStatusStepProps) {
  return (
    <div className="flex-1">
      <div className="mb-6 flex items-center justify-between">
        <span className="text-sm font-medium">설문 진행 상태</span>
      </div>

      <div className="flex h-40 w-full flex-col justify-center py-2">
        <div className="mx-auto flex w-full max-w-2xl items-start justify-between">
          {[
            {
              id: 'DRAFT',
              icon: FileEdit,
              label: '작성 중',
            },
            {
              id: 'ACTIVE',
              icon: Play,
              label: '진행 중',
            },
            {
              id: 'CLOSED',
              icon: CheckCircle,
              label: '종료',
            },
          ].map((step, index, array) => {
            const currentStatusIndex = ['DRAFT', 'ACTIVE', 'CLOSED'].indexOf(
              status
            );
            const isCompleted = index <= currentStatusIndex;
            const isCurrent = index === currentStatusIndex;
            const isPast = index < currentStatusIndex;

            return (
              <div
                key={step.id}
                className="flex flex-1 items-center last:flex-none"
              >
                <div className="relative flex flex-col items-center">
                  <div
                    className={cn(
                      'relative flex h-10 w-10 items-center justify-center rounded-full border-2 transition-all duration-300 ease-in-out',
                      isCurrent
                        ? 'scale-110 border-indigo-500 bg-indigo-500 text-white shadow-md ring-4 ring-indigo-500/20'
                        : isCompleted
                          ? 'border-indigo-500 bg-indigo-500 text-white'
                          : 'border-muted bg-background text-muted-foreground'
                    )}
                  >
                    <step.icon className="h-4 w-4" />
                  </div>
                  <span
                    className={cn(
                      'absolute -bottom-8 w-24 text-center text-[10px] font-medium transition-colors duration-300 sm:text-xs',
                      isCompleted || isCurrent
                        ? 'text-foreground font-semibold'
                        : 'text-muted-foreground'
                    )}
                  >
                    {step.label}
                  </span>
                </div>
                {index < array.length - 1 && (
                  <div className="mx-2 flex-1 pt-2">
                    <div className="bg-muted h-1 w-full overflow-hidden rounded-full">
                      <div
                        className={cn(
                          'h-full w-full origin-left bg-indigo-500 transition-transform duration-500 ease-in-out',
                          isPast ? 'scale-x-100' : 'scale-x-0'
                        )}
                      />
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
