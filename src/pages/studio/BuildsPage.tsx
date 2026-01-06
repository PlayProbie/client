/**
 * BuildsPage - 빌드 목록 페이지
 * Route: /games/:gameUuid/builds
 */
import { Plus } from 'lucide-react';
import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import { Button, InlineAlert, Skeleton } from '@/components/ui';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import type { Build } from '@/features/game-streaming';
import { BuildsTable, BuildUploadModal } from '@/features/game-streaming';
import {
  useBuildDeleteMutation,
  useBuildsQuery,
  useGameDetailQuery,
  useUnsavedChanges,
} from '@/features/game-streaming';
import {
  selectHasActiveUploads,
  useUploadStore,
} from '@/stores/useUploadStore';

export default function BuildsPage() {
  const { gameUuid: routeGameUuid } = useParams<{ gameUuid: string }>();
  // route placeholder(':gameUuid')가 아닌 유효한 UUID만 사용
  const gameUuid =
    routeGameUuid && !routeGameUuid.startsWith(':') ? routeGameUuid : undefined;
  const navigate = useNavigate();
  const {
    data: builds,
    isLoading,
    isError,
    refetch,
  } = useBuildsQuery(gameUuid || '');
  const { data: game } = useGameDetailQuery(gameUuid || '');
  const deleteBuildMutation = useBuildDeleteMutation(gameUuid || '');
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [buildToDelete, setBuildToDelete] = useState<Build | null>(null);
  const hasActiveUploads = useUploadStore(selectHasActiveUploads);
  const { showDialog, confirmLeave, cancelLeave } = useUnsavedChanges({
    hasChanges: hasActiveUploads,
    message: '변경사항이 저장되지 않았습니다. 페이지를 떠나시겠습니까?',
  });
  const deleteTargetLabel = buildToDelete?.filename || buildToDelete?.uuid;

  const handleDeleteConfirm = () => {
    if (!gameUuid || !buildToDelete || deleteBuildMutation.isPending) {
      return;
    }

    deleteBuildMutation.mutate(buildToDelete.uuid, {
      onSuccess: () => {
        setBuildToDelete(null);
      },
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-lg font-semibold">Builds</h2>
          <p className="text-muted-foreground text-sm">
            게임 빌드 폴더를 업로드하고 상태를 확인합니다.
          </p>
        </div>
        <Button onClick={() => setIsUploadModalOpen(true)}>
          <Plus className="mr-2 size-4" />
          Upload Build
        </Button>
      </div>

      {/* Hint Box */}
      <div className="border-info/50 bg-info/5 rounded-lg border p-4">
        <p className="text-info text-sm">
          <strong>Tip:</strong> ExecutablePath는 업로드 폴더 내 실행 파일의 상대
          경로입니다. 예) /Game/Binaries/Win64/MyGame.exe
        </p>
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="bg-card rounded-lg border">
          <div className="space-y-1">
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
          </div>
        </div>
      ) : isError ? (
        <InlineAlert
          variant="error"
          title="로딩 실패"
          actions={
            <Button
              size="sm"
              variant="outline"
              onClick={() => refetch()}
            >
              다시 시도
            </Button>
          }
        >
          빌드 목록을 불러오지 못했습니다.
        </InlineAlert>
      ) : !builds || builds.length === 0 ? (
        <div className="bg-card flex flex-col items-center justify-center rounded-lg border py-16">
          <p className="text-muted-foreground mb-4">첫 빌드를 업로드하세요</p>
          <Button onClick={() => setIsUploadModalOpen(true)}>
            <Plus className="mr-2 size-4" />
            Upload Build
          </Button>
        </div>
      ) : (
        <div className="bg-card rounded-lg border">
          <BuildsTable
            builds={builds}
            onDelete={setBuildToDelete}
            onRowClick={() => {
              if (gameUuid) {
                navigate(`/games/${gameUuid}/stream-settings`);
              }
            }}
          />
        </div>
      )}

      {/* Upload Modal */}
      {gameUuid && (
        <BuildUploadModal
          gameUuid={gameUuid}
          gameName={game?.gameName || ''}
          open={isUploadModalOpen}
          onOpenChange={setIsUploadModalOpen}
        />
      )}

      <ConfirmDialog
        open={!!buildToDelete}
        onOpenChange={(nextOpen) => {
          if (!nextOpen) {
            setBuildToDelete(null);
          }
        }}
        title="빌드를 삭제할까요?"
        description={`${
          deleteTargetLabel ? `"${deleteTargetLabel}"` : '선택한 빌드'
        }를 삭제하면 복구할 수 없습니다.`}
        cancelLabel="취소"
        confirmLabel="삭제"
        confirmVariant="destructive"
        onCancel={() => setBuildToDelete(null)}
        onConfirm={handleDeleteConfirm}
      />

      <ConfirmDialog
        open={showDialog}
        onOpenChange={(nextOpen) => {
          if (!nextOpen) cancelLeave();
        }}
        title="변경사항이 저장되지 않았습니다"
        description="이동하면 현재 입력이 사라집니다."
        cancelLabel="취소"
        confirmLabel="이동"
        onCancel={cancelLeave}
        onConfirm={confirmLeave}
      />
    </div>
  );
}
