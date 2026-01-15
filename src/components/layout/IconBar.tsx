import { Gamepad2, Plus, Settings } from 'lucide-react';

import { Button } from '@/components/ui';
import { cn } from '@/lib/utils';

import GameIconButton from './icon-bar-components/GameIconButton';

interface Game {
  gameUuid: string;
  gameName: string;
  iconUrl?: string;
}

interface IconBarProps {
  games: Game[];
  selectedGameUuid?: string;
  onGameSelect: (gameUuid: string) => void;
  onAddGame: () => void;
  onSettings?: () => void;
  onHomeClick?: () => void;
  /** 홈(게임 목록) 버튼이 선택된 상태 */
  isHomeSelected?: boolean;
}

/**
 * 맨 왼쪽 게임 아이콘 사이드바
 * - 홈(게임 목록) 버튼
 * - 게임 아이콘 리스트
 * - 게임 추가 버튼
 * - 설정 버튼
 */
function IconBar({
  games,
  selectedGameUuid,
  onGameSelect,
  onAddGame,
  onSettings,
  onHomeClick,
  isHomeSelected = false,
}: IconBarProps) {
  return (
    <aside
      className={cn(
        'flex h-full w-[72px] shrink-0 flex-col',
        'items-center py-4'
      )}
    >
      {/* 게임 아이콘 리스트 */}
      <div className="flex flex-1 flex-col items-center gap-2">
        {/* 홈 버튼 (게임 목록) */}
        {onHomeClick && (
          <button
            type="button"
            onClick={onHomeClick}
            title="게임 목록"
            className={cn(
              'flex size-12 items-center justify-center rounded-xl transition-all',
              'bg-primary hover:bg-primary/90',
              isHomeSelected && 'ring-primary ring-2 ring-offset-2'
            )}
          >
            <Gamepad2 className="size-6 text-primary-foreground stroke-2" />
          </button>
        )}

        {/* 구분선 */}
        {games.length > 0 && onHomeClick && (
          <div className="bg-border my-1 h-px w-8" />
        )}

        {games.map((game) => (
          <GameIconButton
            key={game.gameUuid}
            name={game.gameName}
            iconUrl={game.iconUrl}
            isSelected={!isHomeSelected && game.gameUuid === selectedGameUuid}
            onClick={() => onGameSelect(game.gameUuid)}
          />
        ))}

        {/* 게임 추가 버튼 */}
        <Button
          variant="ghost"
          size="icon"
          className="text-muted-foreground hover:text-foreground border-muted hover:border-primary mt-2 size-12 rounded-xl border-2 border-dashed"
          onClick={onAddGame}
          title="새 게임 추가"
        >
          <Plus className="size-5" />
        </Button>
      </div>

      {/* 하단 설정 버튼 */}
      {onSettings && (
        <Button
          variant="ghost"
          size="icon"
          className="text-muted-foreground hover:text-foreground size-12"
          onClick={onSettings}
          title="설정"
        >
          <Settings className="size-5" />
        </Button>
      )}
    </aside>
  );
}

export default IconBar;
