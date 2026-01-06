/**
 * GamesListPage - 게임 목록 페이지
 * Route: /games
 */
import { Copy } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

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
import { useGamesQuery } from '@/features/game-streaming';
import type { StreamingGame } from '@/features/game-streaming/types';
import { formatDate } from '@/features/game-streaming/utils';
import { useToast } from '@/hooks/useToast';

export default function GamesListPage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { data: games, isLoading, isError, refetch } = useGamesQuery();

  const handleRowClick = (gameUuid: string) => {
    navigate(`/games/${gameUuid}`);
  };

  const handleCopyUuid = async (
    e: React.MouseEvent,
    game: StreamingGame
  ) => {
    e.stopPropagation();
    await navigator.clipboard.writeText(game.gameUuid);
    toast({
      variant: 'success',
      title: '복사 완료',
      description: '게임 UUID가 클립보드에 복사되었습니다.',
    });
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="container mx-auto py-8">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">게임 목록</h1>
            <p className="text-muted-foreground text-sm">
              게임을 선택해 빌드와 스트리밍 설정을 관리합니다.
            </p>
          </div>
        </div>
        <div className="bg-card rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Game Name</TableHead>
                <TableHead>Game UUID</TableHead>
                <TableHead>Builds</TableHead>
                <TableHead>Updated</TableHead>
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
                    <Skeleton className="h-5 w-8" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-5 w-24" />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    );
  }

  // Error state
  if (isError) {
    return (
      <div className="container mx-auto py-8">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">게임 목록</h1>
            <p className="text-muted-foreground text-sm">
              게임을 선택해 빌드와 스트리밍 설정을 관리합니다.
            </p>
          </div>
        </div>
        <div className="bg-card flex flex-col items-center justify-center rounded-lg border py-16">
          <p className="text-muted-foreground mb-4">
            게임 목록을 불러오지 못했습니다.
          </p>
          <Button
            onClick={() => refetch()}
            variant="outline"
          >
            다시 시도
          </Button>
        </div>
      </div>
    );
  }

  // Empty state
  if (!games || games.length === 0) {
    return (
      <div className="container mx-auto py-8">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">게임 목록</h1>
            <p className="text-muted-foreground text-sm">
              게임을 선택해 빌드와 스트리밍 설정을 관리합니다.
            </p>
          </div>
        </div>
        <div className="bg-card flex flex-col items-center justify-center rounded-lg border py-16">
          <p className="text-muted-foreground mb-4">
            등록된 게임이 없습니다
          </p>
        </div>
      </div>
    );
  }

  // Success state
  return (
    <div className="container mx-auto py-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">게임 목록</h1>
          <p className="text-muted-foreground text-sm">
            게임을 선택해 빌드와 스트리밍 설정을 관리합니다.
          </p>
        </div>
      </div>

      <div className="bg-card rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Game Name</TableHead>
              <TableHead>Game UUID</TableHead>
              <TableHead>Builds</TableHead>
              <TableHead>Updated</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {games.map((game) => (
              <TableRow
                key={game.gameUuid}
                className="hover:bg-muted/50 cursor-pointer"
                onClick={() => handleRowClick(game.gameUuid)}
              >
                <TableCell className="font-medium">{game.gameName}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <code className="bg-muted rounded px-2 py-0.5 font-mono text-xs">
                      {game.gameUuid}
                    </code>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="size-7"
                      onClick={(e) => handleCopyUuid(e, game)}
                      title="UUID 복사"
                    >
                      <Copy className="size-3.5" />
                    </Button>
                  </div>
                </TableCell>
                <TableCell>
                  {game.buildsCount > 0 ? game.buildsCount : '-'}
                </TableCell>
                <TableCell>{formatDate(game.updatedAt)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
