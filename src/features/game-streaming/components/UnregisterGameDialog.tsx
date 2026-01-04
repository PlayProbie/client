/**
 * UnregisterGameDialog - 스트리밍 게임 등록 해제 확인 다이얼로그
 */
import { Button, SubmitButton } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/Dialog';

import { useUnregisterStreamingGameMutation } from '../hooks';
import type { GameListItem } from '../types';

interface UnregisterGameDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  game: GameListItem | null;
}

export function UnregisterGameDialog({
  open,
  onOpenChange,
  game,
}: UnregisterGameDialogProps) {
  const unregisterMutation = useUnregisterStreamingGameMutation();

  const handleUnregister = () => {
    if (!game) return;

    unregisterMutation.mutate(game.gameUuid, {
      onSuccess: () => {
        onOpenChange(false);
      },
    });
  };

  const handleClose = () => {
    onOpenChange(false);
  };

  return (
    <Dialog
      open={open}
      onOpenChange={handleClose}
    >
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>스트리밍 등록 해제</DialogTitle>
          <DialogDescription>
            <strong>{game?.gameName}</strong>의 스트리밍 등록을 해제합니다.
            <br />
            관련 빌드 파일도 함께 삭제됩니다.
            <br />
            <span className="text-muted-foreground">
              (원본 게임 데이터는 유지됩니다)
            </span>
          </DialogDescription>
        </DialogHeader>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={handleClose}
            disabled={unregisterMutation.isPending}
          >
            취소
          </Button>
          <SubmitButton
            variant="destructive"
            isPending={unregisterMutation.isPending}
            onClick={handleUnregister}
          >
            등록 해제
          </SubmitButton>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// Legacy alias
/** @deprecated Use UnregisterGameDialog instead */
export const DeleteGameDialog = UnregisterGameDialog;
