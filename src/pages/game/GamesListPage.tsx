/**
 * GamesListPage - 게임 목록 페이지
 * Route: /games
 */
import { Plus } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { Button } from '@/components/ui/button';
import {
  type Game,
  GameDeleteConfirmModal,
  GameFormModal,
  GamesTable,
  useCreateGameMutation,
  useDeleteGameMutation,
  useGameForm,
  useGamesQuery,
  useUpdateGameMutation,
} from '@/features/game';
import { useToast } from '@/hooks/useToast';
import { useCurrentWorkspaceStore } from '@/stores/useCurrentWorkspaceStore';

export default function GamesListPage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { currentWorkspace } = useCurrentWorkspaceStore();

  // Queries
  const {
    data: games,
    isLoading,
    isError,
    refetch,
  } = useGamesQuery({
    workspaceUuid: currentWorkspace?.workspaceUuid || '',
  });

  // Mutations
  const createMutation = useCreateGameMutation();
  const updateMutation = useUpdateGameMutation();
  const deleteMutation = useDeleteGameMutation();

  // Custom Hooks
  const {
    formData,
    setFormData,
    resetForm,
    setFormFromData,
    handleGenreToggle,
  } = useGameForm();

  // Modal states
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedGame, setSelectedGame] = useState<Game | null>(null);

  // Handlers
  const handleRowClick = (gameUuid: string) => {
    navigate(`/games/${gameUuid}`);
  };

  const handleCopyUuid = async (e: React.MouseEvent, game: Game) => {
    e.stopPropagation();
    await navigator.clipboard.writeText(game.gameUuid);
    toast({
      variant: 'success',
      title: '복사 완료',
      description: '게임 UUID가 클립보드에 복사되었습니다.',
    });
  };

  const handleOpenCreate = () => {
    resetForm();
    setIsCreateModalOpen(true);
  };

  const handleOpenEdit = (e: React.MouseEvent, game: Game) => {
    e.stopPropagation();
    setSelectedGame(game);
    setFormFromData({
      gameName: game.gameName,
      gameGenre: game.gameGenre,
      gameContext: game.gameContext,
    });
    setIsEditModalOpen(true);
  };

  const handleOpenDelete = (e: React.MouseEvent, game: Game) => {
    e.stopPropagation();
    setSelectedGame(game);
    setIsDeleteModalOpen(true);
  };

  const handleCreate = () => {
    createMutation.mutate(formData, {
      onSuccess: () => {
        setIsCreateModalOpen(false);
        resetForm();
      },
    });
  };

  const handleUpdate = () => {
    if (!selectedGame) return;
    updateMutation.mutate(
      { gameUuid: selectedGame.gameUuid, data: formData },
      {
        onSuccess: () => {
          setIsEditModalOpen(false);
          setSelectedGame(null);
        },
      }
    );
  };

  const handleDelete = () => {
    if (!selectedGame) return;
    deleteMutation.mutate(selectedGame.gameUuid, {
      onSuccess: () => {
        setIsDeleteModalOpen(false);
        setSelectedGame(null);
      },
    });
  };

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
  if (!isLoading && (!games || games.length === 0)) {
    return (
      <div className="container mx-auto py-8">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">게임 목록</h1>
            <p className="text-muted-foreground text-sm">
              게임을 선택해 빌드와 스트리밍 설정을 관리합니다.
            </p>
          </div>
          <Button onClick={handleOpenCreate}>
            <Plus className="mr-2 size-4" />새 게임
          </Button>
        </div>
        <div className="bg-card flex flex-col items-center justify-center rounded-lg border py-16">
          <p className="text-muted-foreground mb-4">등록된 게임이 없습니다</p>
          <Button onClick={handleOpenCreate}>
            <Plus className="mr-2 size-4" />첫 게임 만들기
          </Button>
        </div>

        <GameFormModal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          title="새 게임 만들기"
          description="새 게임의 정보를 입력하세요."
          formData={formData}
          setFormData={setFormData}
          onGenreToggle={handleGenreToggle}
          onSubmit={handleCreate}
          isSubmitting={createMutation.isPending}
          submitLabel="생성"
        />
      </div>
    );
  }

  // Success (Table) state
  return (
    <div className="container mx-auto py-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">게임 목록</h1>
          <p className="text-muted-foreground text-sm">
            게임을 선택해 빌드와 스트리밍 설정을 관리합니다.
          </p>
        </div>
        <Button onClick={handleOpenCreate}>
          <Plus className="mr-2 size-4" />새 게임
        </Button>
      </div>

      <GamesTable
        games={games || []}
        isLoading={isLoading}
        onRowClick={handleRowClick}
        onCopyUuid={handleCopyUuid}
        onEdit={handleOpenEdit}
        onDelete={handleOpenDelete}
      />

      {/* Create Modal */}
      <GameFormModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="새 게임 만들기"
        description="새 게임의 정보를 입력하세요."
        formData={formData}
        setFormData={setFormData}
        onGenreToggle={handleGenreToggle}
        onSubmit={handleCreate}
        isSubmitting={createMutation.isPending}
        submitLabel="생성"
      />

      {/* Edit Modal */}
      <GameFormModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="게임 수정"
        description="게임 정보를 수정하세요."
        formData={formData}
        setFormData={setFormData}
        onGenreToggle={handleGenreToggle}
        onSubmit={handleUpdate}
        isSubmitting={updateMutation.isPending}
        submitLabel="저장"
      />

      {/* Delete Confirmation Modal */}
      <GameDeleteConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        gameName={selectedGame?.gameName}
        onConfirm={handleDelete}
        isDeleting={deleteMutation.isPending}
      />
    </div>
  );
}
