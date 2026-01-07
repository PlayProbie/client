import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/Dialog';

interface WorkspaceDeleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  workspaceName?: string;
  onConfirm: () => void;
  isDeleting: boolean;
}

export function WorkspaceDeleteModal({
  isOpen,
  onClose,
  workspaceName,
  onConfirm,
  isDeleting,
}: WorkspaceDeleteModalProps) {
  return (
    <Dialog
      open={isOpen}
      onOpenChange={onClose}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>워크스페이스 삭제</DialogTitle>
          <DialogDescription>
            정말로 "{workspaceName}" 워크스페이스를 삭제하시겠습니까? <br />
            포함된 모든 게임과 데이터가 영구적으로 삭제됩니다.
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
