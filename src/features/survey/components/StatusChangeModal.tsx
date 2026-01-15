import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/Checkbox';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/Dialog';
import { Label } from '@/components/ui/Label';
import { ButtonLoading } from '@/components/ui/loading';
import type { SurveyStatusValue } from '@/features/game-streaming-survey/types';

interface StatusChangeModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  nextStatus: SurveyStatusValue;
  isPending?: boolean;
  onConfirm: () => void;
}

const STATUS_CONTENT: Record<
  SurveyStatusValue,
  {
    title: string;
    description: string;
    confirmLabel: string;
    confirmVariant: 'default' | 'destructive';
    checklist: string[];
    requiresAck: boolean;
  }
> = {
  DRAFT: {
    title: '설문을 초안으로 변경하시겠습니까?',
    description: '초안 상태로 변경하면 문항을 수정할 수 있습니다.',
    confirmLabel: '초안으로 변경',
    confirmVariant: 'default',
    checklist: [
      '설문이 비활성화됩니다.',
      '문항을 수정할 수 있습니다.',
      '테스터에게 링크가 공개되지 않습니다.',
    ],
    requiresAck: false,
  },
  ACTIVE: {
    title: '설문을 시작하시겠습니까?',
    description: '설문이 시작되면 문항 수정이 제한됩니다.',
    confirmLabel: '설문 시작',
    confirmVariant: 'default',
    checklist: [
      '문항 수정이 불가능합니다.',
      '테스터에게 링크가 공개됩니다.',
      '인스턴스 비용이 발생할 수 있습니다.',
    ],
    requiresAck: true,
  },
  CLOSED: {
    title: '설문을 종료하시겠습니까?',
    description: '종료 후에는 더 이상 응답을 받을 수 없습니다.',
    confirmLabel: '설문 종료',
    confirmVariant: 'destructive',
    checklist: [
      '설문 링크가 비활성화됩니다.',
      '더 이상 응답을 받지 않습니다.',
      '재개하려면 새 설문을 생성해야 합니다.',
    ],
    requiresAck: false,
  },
};

export function StatusChangeModal({
  open,
  onOpenChange,
  nextStatus,
  isPending = false,
  onConfirm,
}: StatusChangeModalProps) {
  const [isAcknowledged, setIsAcknowledged] = useState(false);
  const content = STATUS_CONTENT[nextStatus];

  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
    >
      <DialogContent className="sm:max-w-[520px]">
        <DialogHeader>
          <DialogTitle>{content.title}</DialogTitle>
          <DialogDescription>{content.description}</DialogDescription>
        </DialogHeader>

        <ul className="text-muted-foreground list-disc space-y-1 pl-5 text-sm">
          {content.checklist.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>

        {content.requiresAck && (
          <div className="mt-3 flex items-start gap-2 rounded-md border p-3">
            <Checkbox
              id="survey-status-ack"
              checked={isAcknowledged}
              onCheckedChange={(checked) =>
                setIsAcknowledged(checked === true)
              }
              disabled={isPending}
            />
            <Label
              htmlFor="survey-status-ack"
              className="text-sm"
            >
              위 내용을 확인했습니다.
            </Label>
          </div>
        )}

        <DialogFooter className="gap-2 sm:gap-0">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isPending}
          >
            취소
          </Button>
          <Button
            variant={content.confirmVariant}
            onClick={onConfirm}
            disabled={
              isPending || (content.requiresAck && !isAcknowledged)
            }
          >
            <ButtonLoading
              isLoading={isPending}
              loadingText="변경 중..."
            >
              {content.confirmLabel}
            </ButtonLoading>
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
