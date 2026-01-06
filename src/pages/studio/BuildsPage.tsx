/**
 * BuildsPage - 빌드 목록 페이지
 * Route: /games/:gameUuid/builds
 */
import { Plus } from 'lucide-react';
import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import { Button, InlineAlert, Skeleton } from '@/components/ui';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { BuildsTable, BuildUploadModal } from '@/features/game-streaming';
import {
  useBuildsQuery,
  useGameDetailQuery,
  useUnsavedChanges,
} from '@/features/game-streaming';
import {
  selectHasActiveUploads,
  useUploadStore,
} from '@/stores/useUploadStore';

export default function BuildsPage() {
  const { gameUuid } = useParams<{ gameUuid: string }>();
  const navigate = useNavigate();
  const {
    data: builds,
    isLoading,
    isError,
    refetch,
  } = useBuildsQuery(gameUuid || '');
  const { data: game } = useGameDetailQuery(gameUuid || '');
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const hasActiveUploads = useUploadStore(selectHasActiveUploads);
  const { showDialog, confirmLeave, cancelLeave } = useUnsavedChanges({
    hasChanges: hasActiveUploads,
    message: '변경사항이 저장되지 않았습니다. 페이지를 떠나시겠습니까?',
  });

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
          <strong>Tip:</strong> ExecutablePath는 업로드 폴더 내 실행 파일의
          상대 경로입니다. 예) /Game/Binaries/Win64/MyGame.exe
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
