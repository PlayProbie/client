import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/Dialog';

interface StreamCompletionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  sessionUuid: string;
  onStartSurvey: () => void | Promise<void>;
}

export function StreamCompletionDialog({
  open,
  onOpenChange,
  sessionUuid,
  onStartSurvey,
}: StreamCompletionDialogProps) {
  const handleStartSurvey = async () => {
    if (!sessionUuid) return;
    await onStartSurvey();
  };

  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
    >
      <DialogContent
        showCloseButton={false}
        onPointerDownOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle>게임 플레이가 종료되었습니다</DialogTitle>
          <DialogDescription>
            플레이해주셔서 감사합니다. 설문 페이지에서 피드백을 남겨주세요.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="gap-2">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            닫기
          </Button>
          <Button
            disabled={!sessionUuid}
            onClick={handleStartSurvey}
          >
            설문 참여하기
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
