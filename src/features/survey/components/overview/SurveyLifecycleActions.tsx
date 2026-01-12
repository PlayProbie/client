import { CheckCircle2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { type SurveyStatus } from '@/features/game-streaming-survey/types';

interface SurveyLifecycleActionsProps {
  status: SurveyStatus;
  isPending: boolean;
  canExecute: boolean;
  onSetStatus: (status: 'ACTIVE' | 'CLOSED') => void;
}

export function SurveyLifecycleActions({
  status,
  isPending,
  canExecute,
  onSetStatus,
}: SurveyLifecycleActionsProps) {
  return (
    <div className="flex min-h-[80px] flex-col items-center justify-center gap-4 py-4 sm:flex-row sm:justify-between">
      {/* Status Description Area */}
      <div className="flex flex-1 items-center justify-center sm:justify-start">
        {status === 'DRAFT' && (
          <p className="text-muted-foreground text-center text-xs sm:text-left">
            설문을 시작하면 스트리밍 플레이와 인터뷰가 활성화됩니다.
          </p>
        )}
        {status === 'ACTIVE' && (
          <div className="flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="bg-success absolute inline-flex h-full w-full animate-ping rounded-full opacity-75"></span>
              <span className="bg-success relative inline-flex h-2 w-2 rounded-full"></span>
            </span>
            <p className="text-muted-foreground text-xs">
              설문이 현재 활성화 상태입니다.
            </p>
          </div>
        )}
      </div>

      {/* Action Button Area - Fixed Width for Stability */}
      <div className="flex w-full items-center justify-center sm:w-auto sm:min-w-[140px] sm:justify-end">
        {status === 'DRAFT' && (
          <Button
            className="w-full sm:w-auto"
            onClick={() => onSetStatus('ACTIVE')}
            disabled={!canExecute || isPending}
          >
            설문 시작하기
          </Button>
        )}
        {status === 'ACTIVE' && (
          <Button
            variant="destructive"
            className="w-full sm:w-auto"
            onClick={() => onSetStatus('CLOSED')}
            disabled={!canExecute || isPending}
          >
            설문 종료하기
          </Button>
        )}
        {status === 'CLOSED' && (
          <div className="bg-muted/50 text-muted-foreground flex items-center gap-2 rounded-md px-3 py-1">
            <CheckCircle2 className="h-4 w-4" />
            <span className="text-sm font-medium">설문 완료</span>
          </div>
        )}
      </div>
    </div>
  );
}
