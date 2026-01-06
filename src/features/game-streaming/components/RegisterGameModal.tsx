/**
 * RegisterGameModal - 스트리밍 게임 등록 모달
 * 기존 Source Game을 선택하여 스트리밍 시스템에 등록
 */
import { useActionState, useEffect } from 'react';

import { Button, SubmitButton } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/Dialog';
import { Label } from '@/components/ui/Label';
import { Spinner } from '@/components/ui/loading';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/Select';

import {
  useAvailableSourceGamesQuery,
  useRegisterStreamingGameMutation,
} from '../hooks';

interface RegisterGameModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface FormState {
  success: boolean;
  error: string | null;
}

const initialState: FormState = {
  success: false,
  error: null,
};

export function RegisterGameModal({
  open,
  onOpenChange,
}: RegisterGameModalProps) {
  const { data: availableGames, isLoading: isLoadingGames } =
    useAvailableSourceGamesQuery();
  const registerMutation = useRegisterStreamingGameMutation();

  const [state, formAction, isPending] = useActionState(
    async (_prevState: FormState, formData: FormData): Promise<FormState> => {
      const gameUuid = (formData.get('gameUuid') as string)?.trim();

      if (!gameUuid) {
        return { success: false, error: '게임을 선택해주세요.' };
      }

      try {
        await registerMutation.mutateAsync({ gameUuid });
        return { success: true, error: null };
      } catch {
        return { success: false, error: '스트리밍 등록에 실패했습니다.' };
      }
    },
    initialState
  );

  // 성공 시 모달 닫기
  useEffect(() => {
    if (state.success) {
      onOpenChange(false);
    }
  }, [state.success, onOpenChange]);

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
          <DialogTitle>스트리밍 게임 등록</DialogTitle>
          <DialogDescription>
            GameLift Streams에 등록할 게임을 선택합니다.
          </DialogDescription>
        </DialogHeader>

        <form action={formAction}>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="game-select">게임 선택</Label>
              {isLoadingGames ? (
                <div className="flex items-center gap-2 py-2">
                  <Spinner size="sm" />
                  <span className="text-muted-foreground text-sm">
                    게임 목록을 불러오는 중...
                  </span>
                </div>
              ) : availableGames && availableGames.length > 0 ? (
                <Select
                  name="gameUuid"
                  disabled={isPending}
                >
                  <SelectTrigger id="game-select">
                    <SelectValue placeholder="게임을 선택하세요" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableGames.map((game) => (
                      <SelectItem
                        key={game.gameUuid}
                        value={game.gameUuid}
                      >
                        <div className="flex flex-col">
                          <span>{game.gameName}</span>
                          <span className="text-muted-foreground text-xs">
                            {game.gameGenre.join(', ')}
                          </span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <p className="text-muted-foreground py-2 text-sm">
                  등록 가능한 게임이 없습니다.
                </p>
              )}
              {state.error && (
                <p className="text-destructive text-sm">{state.error}</p>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isPending}
            >
              취소
            </Button>
            <SubmitButton
              isPending={isPending}
              disabled={!availableGames || availableGames.length === 0}
            >
              등록
            </SubmitButton>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
