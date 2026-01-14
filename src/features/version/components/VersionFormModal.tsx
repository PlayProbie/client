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

import type { CreateVersionRequest, VersionStatus } from '../types';

const VERSION_STATUS_OPTIONS: { value: VersionStatus; label: string }[] = [
  { value: 'stable', label: 'Stable (안정 버전)' },
  { value: 'beta', label: 'Beta (테스트 버전)' },
  { value: 'legacy', label: 'Legacy (구 버전)' },
];

interface VersionFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  formData: CreateVersionRequest;
  setFormData: React.Dispatch<React.SetStateAction<CreateVersionRequest>>;
  onSubmit: () => void;
  isSubmitting: boolean;
}

/**
 * 버전 생성 모달 컴포넌트
 */
export function VersionFormModal({
  isOpen,
  onClose,
  formData,
  setFormData,
  onSubmit,
  isSubmitting,
}: VersionFormModalProps) {
  return (
    <Dialog
      open={isOpen}
      onOpenChange={onClose}
    >
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle>새 버전 추가</DialogTitle>
          <DialogDescription>
            게임의 새 버전 정보를 입력하세요.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-6 py-4">
          <div className="grid gap-2">
            <Label
              htmlFor="versionName"
              required
            >
              버전 이름
            </Label>
            <Input
              id="versionName"
              value={formData.versionName}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, versionName: e.target.value }))
              }
              placeholder="예: v1.0.0-stable"
              required
            />
            <p className="text-muted-foreground text-xs">
              시맨틱 버전 형식 권장 (예: v1.2.0-beta.1)
            </p>
          </div>

          <div className="grid gap-2">
            <Label>버전 상태</Label>
            <div className="flex flex-wrap gap-2">
              {VERSION_STATUS_OPTIONS.map(({ value, label }) => (
                <Button
                  key={value}
                  type="button"
                  size="sm"
                  variant={formData.status === value ? 'default' : 'outline'}
                  onClick={() => setFormData((prev) => ({ ...prev, status: value }))}
                >
                  {label}
                </Button>
              ))}
            </div>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="description">설명 (선택)</Label>
            <Textarea
              id="description"
              value={formData.description || ''}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  description: e.target.value,
                }))
              }
              placeholder="이 버전에 대한 간단한 설명을 입력하세요."
              rows={3}
            />
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={onClose}
          >
            취소
          </Button>
          <Button
            onClick={onSubmit}
            disabled={isSubmitting || !formData.versionName.trim()}
          >
            {isSubmitting ? '처리 중...' : '추가'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
