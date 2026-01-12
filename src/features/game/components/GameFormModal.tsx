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

const MAX_GENRE_SELECTION = 3;

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
      <DialogContent className="sm:max-w-[640px]">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>

        <div className="grid gap-8 py-4">
          <div className="grid gap-2">
            <Label
              htmlFor="gameName"
              required
            >
              게임 이름
            </Label>
            <Input
              id="gameName"
              value={formData.gameName}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, gameName: e.target.value }))
              }
              placeholder="예: My RPG Game"
              required
            />
          </div>

          <div className="grid gap-2">
            <div className="flex items-center justify-between">
              <Label required>장르 (최대 3개 선택)</Label>
              <span className="text-muted-foreground text-sm">
                {formData.gameGenre.length}/{MAX_GENRE_SELECTION} 선택됨
              </span>
            </div>
            <div className="flex flex-wrap gap-2">
              {Object.entries(GameGenreConfig).map(([key, { value, label }]) => {
                const isSelected = formData.gameGenre.includes(value);
                const isMaxReached =
                  formData.gameGenre.length >= MAX_GENRE_SELECTION;
                const isDisabled = !isSelected && isMaxReached;

                return (
                  <Button
                    key={key}
                    type="button"
                    size="sm"
                    variant={isSelected ? 'default' : 'outline'}
                    disabled={isDisabled}
                    onClick={() => onGenreToggle(value)}
                  >
                    {label}
                  </Button>
                );
              })}
            </div>
          </div>

          <div className="grid gap-2">
            <Label
              htmlFor="gameContext"
              required
            >
              게임 설명
            </Label>
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
              rows={5}
              required
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
            disabled={
              isSubmitting ||
              !formData.gameName.trim() ||
              formData.gameGenre.length === 0 ||
              !formData.gameContext.trim()
            }
          >
            {isSubmitting ? '처리 중...' : submitLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
