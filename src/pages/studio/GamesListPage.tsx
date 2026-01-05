/**
 * GamesListPage - 스트리밍 게임 목록 페이지
 * Route: /studio/games
 */
import { Plus, Trash2 } from 'lucide-react';
import { useState } from 'react';
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
import {
  RegisterGameModal,
  UnregisterGameDialog,
} from '@/features/game-streaming';
import { useGamesQuery } from '@/features/game-streaming';
import type { StreamingGame } from '@/features/game-streaming/types';
import { formatDate } from '@/features/game-streaming/utils';

export default function GamesListPage() {
  const navigate = useNavigate();
  const { data: games, isLoading, isError, refetch } = useGamesQuery();

  // Modal states
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);
  const [isUnregisterDialogOpen, setIsUnregisterDialogOpen] = useState(false);
  const [selectedGame, setSelectedGame] = useState<StreamingGame | null>(null);

  const handleRowClick = (gameUuid: string) => {
    navigate(`/studio/games/${gameUuid}/overview`);
  };

  const handleUnregisterClick = (e: React.MouseEvent, game: StreamingGame) => {
    e.stopPropagation();
    setSelectedGame(game);
    setIsUnregisterDialogOpen(true);
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="container mx-auto py-8">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">스트리밍 게임 목록</h1>
            <p className="text-muted-foreground text-sm">
              GameLift Streams에 등록된 게임을 관리합니다.
            </p>
          </div>
          <Button disabled>
            <Plus className="mr-2 size-4" />
            스트리밍 등록
          </Button>
        </div>
        <div className="bg-card rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Game Name</TableHead>
                <TableHead>Game UUID</TableHead>
                <TableHead>Builds</TableHead>
                <TableHead>Updated</TableHead>
                <TableHead className="w-[80px]">Actions</TableHead>
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
                  <TableCell>
                    <Skeleton className="h-8 w-10" />
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
            <h1 className="text-2xl font-bold">스트리밍 게임 목록</h1>
            <p className="text-muted-foreground text-sm">
              GameLift Streams에 등록된 게임을 관리합니다.
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
            <h1 className="text-2xl font-bold">스트리밍 게임 목록</h1>
            <p className="text-muted-foreground text-sm">
              GameLift Streams에 등록된 게임을 관리합니다.
            </p>
          </div>
          <Button onClick={() => setIsRegisterModalOpen(true)}>
            <Plus className="mr-2 size-4" />
            스트리밍 등록
          </Button>
        </div>
        <div className="bg-card flex flex-col items-center justify-center rounded-lg border py-16">
          <p className="text-muted-foreground mb-4">
            스트리밍에 등록된 게임이 없습니다
          </p>
          <Button onClick={() => setIsRegisterModalOpen(true)}>
            <Plus className="mr-2 size-4" />
            스트리밍 등록
          </Button>
        </div>

        {/* Register Modal */}
        <RegisterGameModal
          open={isRegisterModalOpen}
          onOpenChange={setIsRegisterModalOpen}
        />
      </div>
    );
  }

  // Success state
  return (
    <div className="container mx-auto py-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">스트리밍 게임 목록</h1>
          <p className="text-muted-foreground text-sm">
            GameLift Streams에 등록된 게임을 관리합니다.
          </p>
        </div>
        <Button onClick={() => setIsRegisterModalOpen(true)}>
          <Plus className="mr-2 size-4" />
          스트리밍 등록
        </Button>
      </div>

      <div className="bg-card rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Game Name</TableHead>
              <TableHead>Game UUID</TableHead>
              <TableHead>Builds</TableHead>
              <TableHead>Updated</TableHead>
              <TableHead className="w-[80px]">Actions</TableHead>
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
                  <code className="bg-muted rounded px-2 py-0.5 font-mono text-xs">
                    {game.gameUuid}
                  </code>
                </TableCell>
                <TableCell>
                  {game.buildsCount > 0 ? game.buildsCount : '-'}
                </TableCell>
                <TableCell>{formatDate(game.updatedAt)}</TableCell>
                <TableCell>
                  <div className="flex gap-1">
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={(e) => handleUnregisterClick(e, game)}
                      title="등록 해제"
                    >
                      <Trash2 className="text-destructive size-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Register Modal */}
      <RegisterGameModal
        open={isRegisterModalOpen}
        onOpenChange={setIsRegisterModalOpen}
      />

      {/* Unregister Dialog */}
      <UnregisterGameDialog
        open={isUnregisterDialogOpen}
        onOpenChange={setIsUnregisterDialogOpen}
        game={selectedGame}
      />
    </div>
  );
}
