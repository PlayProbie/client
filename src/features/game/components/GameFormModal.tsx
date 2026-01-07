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

import { type CreateGameRequest, GameGenreConfig } from '../types';

interface GameFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description: string;
  formData: CreateGameRequest;
  setFormData: React.Dispatch<React.SetStateAction<CreateGameRequest>>;
  onGenreToggle: (genre: string) => void;
  onSubmit: () => void;
  isSubmitting: boolean;
  submitLabel: string;
}

/**
 * 게임 생성/수정 모달 컴포넌트
 */
export function GameFormModal({
  isOpen,
  onClose,
  title,
  description,
  formData,
  setFormData,
  onGenreToggle,
  onSubmit,
  isSubmitting,
  submitLabel,
}: GameFormModalProps) {
  return (
    <Dialog
      open={isOpen}
      onOpenChange={onClose}
    >
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="gameName">게임 이름</Label>
            <Input
              id="gameName"
              value={formData.gameName}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, gameName: e.target.value }))
              }
              placeholder="예: My RPG Game"
            />
          </div>

          <div className="grid gap-2">
            <Label>장르 (복수 선택 가능)</Label>
            <div className="flex flex-wrap gap-2">
              {Object.entries(GameGenreConfig).map(([key, { label }]) => (
                <Button
                  key={key}
                  type="button"
                  size="sm"
                  variant={
                    formData.gameGenre.includes(key) ? 'default' : 'outline'
                  }
                  onClick={() => onGenreToggle(key)}
                >
                  {label}
                </Button>
              ))}
            </div>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="gameContext">게임 설명</Label>
            <Textarea
              id="gameContext"
              value={formData.gameContext}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  gameContext: e.target.value,
                }))
              }
              placeholder="게임에 대한 간단한 설명을 입력하세요."
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
            disabled={isSubmitting || !formData.gameName}
          >
            {isSubmitting ? '처리 중...' : submitLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
