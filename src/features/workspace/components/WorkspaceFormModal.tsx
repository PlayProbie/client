import { useState } from 'react';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/Dialog';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { Textarea } from '@/components/ui/Textarea';

import { type CreateWorkspaceRequest, type Workspace } from '../types';

interface WorkspaceFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateWorkspaceRequest) => void;
  initialData?: Workspace; // If provided, Edit mode
  isSubmitting: boolean;
}

export function WorkspaceFormModal({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  isSubmitting,
}: WorkspaceFormModalProps) {
  const [name, setName] = useState(initialData?.name || '');
  const [description, setDescription] = useState(
    initialData?.description || ''
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({ name, description });
  };

  const isEdit = !!initialData;

  return (
    <Dialog
      open={isOpen}
      onOpenChange={onClose}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {isEdit ? '워크스페이스 수정' : '새 워크스페이스 만들기'}
          </DialogTitle>
          <DialogDescription>
            {isEdit
              ? '워크스페이스 정보를 수정하세요.'
              : '워크스페이스 이름을 입력하고 팀원들과 협업을 시작하세요.'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="ws-name">이름</Label>
              <Input
                id="ws-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="워크스페이스 이름"
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="ws-desc">설명 (선택)</Label>
              <Textarea
                id="ws-desc"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="워크스페이스에 대한 설명"
                rows={3}
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
            >
              취소
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting || !name.trim()}
            >
              {isSubmitting
                ? '처리 중...'
                : isEdit
                  ? '수정 완료'
                  : '워크스페이스 생성'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
