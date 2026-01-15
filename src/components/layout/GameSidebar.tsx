import { Plus } from 'lucide-react';
import { Link } from 'react-router-dom';

import { Button } from '@/components/ui';
import { ScrollArea } from '@/components/ui/ScrollArea';
import type { Version } from '@/features/version';
import { cn } from '@/lib/utils';

interface GameInfo {
  gameUuid: string;
  gameName: string;
  coverUrl?: string;
}

interface GameSidebarProps {
  game: GameInfo;
  versions: Version[];
  selectedVersionUuid?: string;
  onVersionSelect: (versionUuid: string) => void;
  onAddVersion: () => void;
  isCollapsed?: boolean;
}

/**
 * 게임 선택 시 표시되는 두번째 사이드바
 * - 게임 대표 이미지 + 이름
 * - 버전 리스트 (선택 가능)
 */
function GameSidebar({
  game,
  versions,
  selectedVersionUuid,
  onVersionSelect,
  onAddVersion,
  isCollapsed = false,
}: GameSidebarProps) {
  if (isCollapsed) return null;

  return (
    <aside
      className={cn(
        'border-sidebar-border bg-sidebar flex h-full w-60 shrink-0 flex-col border-r'
      )}
    >
      {/* 게임 헤더 */}
      <Link
        to={`/games/${game.gameUuid}/overview`}
        className="block border-b p-4 transition-colors hover:bg-muted/50"
      >
        {/* 게임 커버 이미지 */}
        <div className="bg-muted mb-3 aspect-video w-full overflow-hidden rounded-lg">
          {game.coverUrl ? (
            <img
              src={game.coverUrl}
              alt={game.gameName}
              className="size-full object-cover"
            />
          ) : (
            <div className="flex size-full items-center justify-center">
              <span className="text-muted-foreground text-4xl font-bold">
                {game.gameName.charAt(0).toUpperCase()}
              </span>
            </div>
          )}
        </div>

        {/* 게임 이름 */}
        <h2 className="text-foreground truncate text-lg font-semibold">
          {game.gameName}
        </h2>
      </Link>

      {/* 버전 섹션 */}
      <div className="flex items-center justify-between px-4 py-3">
        <span className="text-muted-foreground text-xs font-medium uppercase tracking-wider">
          Versions
        </span>
        <Button
          variant="ghost"
          size="icon"
          className="text-primary size-6"
          onClick={onAddVersion}
          title="새 버전 추가"
        >
          <Plus className="size-4" />
        </Button>
      </div>

      {/* 버전 리스트 */}
      <ScrollArea className="flex-1 px-2">
        <div className="space-y-1 pb-4">
          {versions.length === 0 ? (
            <p className="text-muted-foreground px-2 py-4 text-center text-sm">
              버전이 없습니다.
              <br />
              새 버전을 추가하세요.
            </p>
          ) : (
            versions.map((version) => (
              <Link
                key={version.versionUuid}
                to={`/games/${game.gameUuid}/versions/${version.versionUuid}`}
                onClick={() => onVersionSelect(version.versionUuid)}
                className={cn(
                  'flex items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors',
                  'hover:bg-accent hover:text-accent-foreground',
                  selectedVersionUuid === version.versionUuid &&
                    'bg-accent text-accent-foreground font-medium'
                )}
              >
                {/* 상태 표시 점 */}
                <span
                  className={cn(
                    'size-2 rounded-full',
                    version.status === 'stable' && 'bg-success',
                    version.status === 'beta' && 'bg-warning',
                    version.status === 'legacy' && 'bg-muted-foreground'
                  )}
                />
                <div className="flex-1 truncate">
                  <div className="truncate font-medium">
                    {version.versionName}
                  </div>
                  <div className="text-muted-foreground truncate text-xs">
                    {version.description}
                  </div>
                </div>
              </Link>
            ))
          )}
        </div>
      </ScrollArea>
    </aside>
  );
}

export default GameSidebar;
