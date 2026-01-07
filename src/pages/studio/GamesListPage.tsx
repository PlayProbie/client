/**
 * GamesListPage - 게임 목록 페이지
 * Route: /games
 */
import { Copy, Edit, Plus, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

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
import { Skeleton } from '@/components/ui/loading';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/Table';
import { Textarea } from '@/components/ui/Textarea';
import {
  type CreateGameRequest,
  type Game,
  GameGenreConfig,
  useCreateGameMutation,
  useDeleteGameMutation,
  useGamesQuery,
  useUpdateGameMutation,
} from '@/features/game';
import { useToast } from '@/hooks/useToast';
import { useCurrentWorkspaceStore } from '@/stores/useCurrentWorkspaceStore';

/** 날짜 포맷팅 */
function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export default function GamesListPage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { currentWorkspace } = useCurrentWorkspaceStore();
  const { data: games, isLoading, isError, refetch } = useGamesQuery({
    workspaceUuid: currentWorkspace?.workspaceUuid || '',
  });

  // Mutations
  const createMutation = useCreateGameMutation();
  const updateMutation = useUpdateGameMutation();
  const deleteMutation = useDeleteGameMutation();

  // Modal states
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedGame, setSelectedGame] = useState<Game | null>(null);

  // Form states
  const [formData, setFormData] = useState<CreateGameRequest>({
    gameName: '',
    gameGenre: [],
    gameContext: '',
  });

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
    setFormData({ gameName: '', gameGenre: [], gameContext: '' });
    setIsCreateModalOpen(true);
  };

  const handleOpenEdit = (e: React.MouseEvent, game: Game) => {
    e.stopPropagation();
    setSelectedGame(game);
    setFormData({
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
        setFormData({ gameName: '', gameGenre: [], gameContext: '' });
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

  const handleGenreToggle = (genre: string) => {
    setFormData((prev) => ({
      ...prev,
      gameGenre: prev.gameGenre.includes(genre)
        ? prev.gameGenre.filter((g) => g !== genre)
        : [...prev.gameGenre, genre],
    }));
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

        {/* Create Modal */}
        <CreateEditModal
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
        <Button onClick={handleOpenCreate}>
          <Plus className="mr-2 size-4" />새 게임
        </Button>
      </div>

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
                onClick={() => handleRowClick(game.gameUuid)}
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
                      onClick={(e) => handleCopyUuid(e, game)}
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
                      onClick={(e) => handleOpenEdit(e, game)}
                      title="수정"
                    >
                      <Edit className="size-4" />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="text-destructive hover:text-destructive size-8"
                      onClick={(e) => handleOpenDelete(e, game)}
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

      {/* Create Modal */}
      <CreateEditModal
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
      <CreateEditModal
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
      <Dialog
        open={isDeleteModalOpen}
        onOpenChange={setIsDeleteModalOpen}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>게임 삭제</DialogTitle>
            <DialogDescription>
              정말로 "{selectedGame?.gameName}" 게임을 삭제하시겠습니까? 관련된
              모든 빌드와 설문이 삭제됩니다.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsDeleteModalOpen(false)}
            >
              취소
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? '삭제 중...' : '삭제'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

/** Create/Edit Modal Component */
interface CreateEditModalProps {
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

function CreateEditModal({
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
}: CreateEditModalProps) {
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
