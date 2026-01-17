import { Copy, Edit, Trash2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/loading';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/Table';
import { formatDate } from '@/lib/utils';

import { type Game, GameGenreConfig } from '../types';

interface GamesTableProps {
  games: Game[];
  isLoading: boolean;
  onRowClick: (gameUuid: string) => void;
  onCopyUuid: (e: React.MouseEvent, game: Game) => void;
  onEdit: (e: React.MouseEvent, game: Game) => void;
  onDelete: (e: React.MouseEvent, game: Game) => void;
}

/**
 * 게임 목록 테이블 컴포넌트
 */
export function GamesTable({
  games,
  isLoading,
  onRowClick,
  onCopyUuid,
  onEdit,
  onDelete,
}: GamesTableProps) {
  if (isLoading) {
    return (
      <div className="bg-card rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Game Name</TableHead>
              <TableHead>Game UUID</TableHead>
              <TableHead>Genre</TableHead>
              <TableHead>Updated</TableHead>
              <TableHead className="w-[100px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {Array.from({ length: 6 }).map((_, i) => (
              <TableRow key={i}>
                <TableCell>
                  <Skeleton className="h-5 w-40" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-5 w-48" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-5 w-24" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-5 w-24" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-8 w-16" />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    );
  }

  return (
    <div className="bg-card rounded-lg border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Game Name</TableHead>
            <TableHead>Game UUID</TableHead>
            <TableHead>Genre</TableHead>
            <TableHead>Updated</TableHead>
            <TableHead className="w-[100px]">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {games.map((game) => (
            <TableRow
              key={game.gameUuid}
              className="hover:bg-muted/50 cursor-pointer"
              onClick={() => onRowClick(game.gameUuid)}
            >
              <TableCell className="font-medium">{game.gameName}</TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <code className="bg-muted rounded px-2 py-0.5 font-mono text-xs">
                    {game.gameUuid.slice(0, 8)}...
                  </code>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="size-7"
                    onClick={(e) => onCopyUuid(e, game)}
                    title="UUID 복사"
                  >
                    <Copy className="size-3.5" />
                  </Button>
                </div>
              </TableCell>
              <TableCell>
                <div className="flex flex-wrap gap-1">
                  {game.gameGenre.slice(0, 2).map((genre) => (
                    <span
                      key={genre}
                      className="bg-secondary text-secondary-foreground rounded px-2 py-0.5 text-xs"
                    >
                      {GameGenreConfig[genre as keyof typeof GameGenreConfig]
                        ?.label || genre}
                    </span>
                  ))}
                  {game.gameGenre.length > 2 && (
                    <span className="text-muted-foreground text-xs">
                      +{game.gameGenre.length - 2}
                    </span>
                  )}
                </div>
              </TableCell>
              <TableCell>{formatDate(game.updatedAt)}</TableCell>
              <TableCell>
                <div className="flex items-center gap-1">
                  <Button
                    size="icon"
                    variant="ghost"
                    className="size-8"
                    onClick={(e) => onEdit(e, game)}
                    title="수정"
                  >
                    <Edit className="size-4" />
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="text-destructive hover:text-destructive size-8"
                    onClick={(e) => onDelete(e, game)}
                    title="삭제"
                  >
                    <Trash2 className="size-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
