import {
  Activity,
  AlertCircle,
  CheckCircle2,
  Layers,
  Server,
} from 'lucide-react';

import { InlineAlert } from '@/components/ui/InlineAlert';
import { cn } from '@/lib/utils';
import {
  type ProvisioningItem,
  ProvisioningStatus,
} from '@/stores/useProvisioningStore';

interface ProvisioningStatusStepProps {
  relatedItems: ProvisioningItem[];
}

export function ProvisioningStatusStep({
  relatedItems,
}: ProvisioningStatusStepProps) {
  return (
    <div className="flex-1">
      <div className="mb-6 flex items-center justify-between">
        <span className="text-sm font-medium">게임 스트리밍 준비 상태</span>
      </div>

      {relatedItems.length > 0 ? (
        <div className="flex h-40 w-full flex-col justify-center py-2">
          <div className="mx-auto flex w-full max-w-2xl items-start justify-between">
            {[
              {
                id: ProvisioningStatus.CREATING,
                icon: Server,
                label: '생성',
              },
              {
                id: ProvisioningStatus.PROVISIONING,
                icon: Activity,
                label: '설정',
              },
              {
                id: ProvisioningStatus.READY,
                icon: CheckCircle2,
                label: '준비',
              },
              {
                id: ProvisioningStatus.ACTIVE,
                icon: Layers,
                label: '활성',
              },
            ].map((step, index, array) => {
              const latestItem = relatedItems[relatedItems.length - 1];
              const STATUS_STEPS = [
                ProvisioningStatus.CREATING,
                ProvisioningStatus.PROVISIONING,
                ProvisioningStatus.READY,
                ProvisioningStatus.ACTIVE,
              ] as const;

              let currentStatusIndex = (
                STATUS_STEPS as readonly ProvisioningStatus[]
              ).indexOf(latestItem.status);

              // If ERROR, default to the first step to show the error state visually
              if (latestItem.status === ProvisioningStatus.ERROR) {
                currentStatusIndex = 0;
              }
              const isCompleted = index <= currentStatusIndex;
              const isCurrent = index === currentStatusIndex;
              const isPast = index < currentStatusIndex;
              const isError =
                latestItem.status === ProvisioningStatus.ERROR &&
                index === currentStatusIndex;

              return (
                <div
                  key={step.id}
                  className="flex flex-1 items-center last:flex-none"
                >
                  <div className="relative flex flex-col items-center">
                    <div
                      className={cn(
                        'relative flex h-10 w-10 items-center justify-center rounded-full border-2 transition-all duration-300 ease-in-out',
                        isError
                          ? 'border-destructive bg-destructive text-destructive-foreground scale-110 shadow-lg'
                          : isCurrent
                            ? 'border-primary bg-primary text-primary-foreground ring-primary/20 scale-110 shadow-md ring-4'
                            : isCompleted
                              ? 'border-primary bg-primary text-primary-foreground'
                              : 'border-muted bg-background text-muted-foreground'
                      )}
                    >
                      {isError ? (
                        <AlertCircle className="h-5 w-5" />
                      ) : (
                        <step.icon className="h-4 w-4" />
                      )}
                    </div>
                    <span
                      className={cn(
                        'absolute -bottom-8 w-24 text-center text-[10px] font-medium transition-colors duration-300 sm:text-xs',
                        isError
                          ? 'text-destructive font-semibold'
                          : isCompleted || isCurrent
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
                            'bg-primary h-full w-full origin-left transition-transform duration-500 ease-in-out',
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

          {relatedItems[relatedItems.length - 1].status ===
            ProvisioningStatus.ERROR && (
            <div className="animate-in fade-in slide-in-from-top-2 mt-8 text-center">
              <InlineAlert
                variant="error"
                title="Provisioning Failed"
                className="mx-auto max-w-sm"
              >
                {relatedItems[relatedItems.length - 1].errorMessage ||
                  'Unknown error occurred.'}
              </InlineAlert>
            </div>
          )}
        </div>
      ) : (
        <div className="bg-muted/20 text-muted-foreground flex h-40 flex-col items-center justify-center rounded-lg border border-dashed text-center">
          <div className="bg-muted mb-3 flex h-12 w-12 items-center justify-center rounded-full">
            <Server className="h-6 w-6 opacity-50" />
          </div>
          <p className="text-sm font-medium">할당 리소스가 없습니다.</p>
          <p className="text-muted-foreground mt-1 text-xs">
            설문을 시작하여 프로비저닝을 시작해주세요.
          </p>
        </div>
      )}
    </div>
  );
}
