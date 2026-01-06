import { Gamepad2 } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from '@/components/ui/Select';
import { useGamesQuery } from '@/features/game-streaming';

/**
 * GameSelector - Topbar 게임 선택 드롭다운
 * - URL 파라미터에서 현재 게임 표시
 * - 게임 선택 시 /games/:gameUuid/overview로 이동
 */
function GameSelector() {
  const navigate = useNavigate();
  const { gameUuid } = useParams<{ gameUuid: string }>();
  const { data: games, isLoading } = useGamesQuery();

  const currentGame = games?.find((game) => game.gameUuid === gameUuid);

  const handleGameSelect = (uuid: string) => {
    navigate(`/games/${uuid}/overview`);
  };

  return (
    <div className="border-border mr-2 flex items-center gap-4 border-r pr-6">
      <Select
        value={gameUuid || ''}
        onValueChange={handleGameSelect}
      >
        <SelectTrigger className="hover:bg-accent hover:text-accent-foreground data-[state=open]:bg-accent/50 focus:ring-ring h-10 w-auto min-w-[140px] gap-2 border-0 bg-transparent px-3 py-2 shadow-none focus:ring-2 focus:ring-offset-2 focus:outline-none">
          <div className="flex items-center gap-2">
            <div className="bg-success/20 flex size-6 items-center justify-center rounded">
              <Gamepad2 className="text-success size-3.5 stroke-2" />
            </div>
            {isLoading ? (
              <span className="text-muted-foreground text-sm">로딩 중...</span>
            ) : currentGame ? (
              <span className="max-w-[120px] truncate text-sm font-medium">
                {currentGame.gameName}
              </span>
            ) : (
              <span className="text-muted-foreground text-sm">게임 선택</span>
            )}
          </div>
        </SelectTrigger>
        <SelectContent align="start">
          {games?.length === 0 && (
            <div className="text-muted-foreground px-2 py-4 text-center text-sm">
              등록된 게임이 없습니다
            </div>
          )}
          {games?.map((game) => (
            <SelectItem
              key={game.gameUuid}
              value={game.gameUuid}
            >
              <div className="flex items-center gap-2">
                <Gamepad2 className="text-muted-foreground size-4" />
                <span className="max-w-48 truncate">{game.gameName}</span>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

export default GameSelector;
