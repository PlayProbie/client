import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/Dialog';

interface GameDeleteConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  gameName?: string;
  onConfirm: () => void;
  isDeleting: boolean;
}

/**
 * 게임 삭제 확인 모달
 */
export function GameDeleteConfirmModal({
  isOpen,
  onClose,
  gameName,
  onConfirm,
  isDeleting,
}: GameDeleteConfirmModalProps) {
  return (
    <Dialog
      open={isOpen}
      onOpenChange={onClose}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>게임 삭제</DialogTitle>
          <DialogDescription>
            정말로 "{gameName}" 게임을 삭제하시겠습니까? 관련된 모든 빌드와
            설문이 삭제됩니다.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={onClose}
          >
            취소
          </Button>
          <Button
            variant="destructive"
            onClick={onConfirm}
            disabled={isDeleting}
          >
            {isDeleting ? '삭제 중...' : '삭제'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
