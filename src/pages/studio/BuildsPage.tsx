/**
 * BuildsPage - 빌드 목록 페이지
 * Route: /studio/games/:gameUuid/builds
 */
import { Plus } from 'lucide-react';
import { useState } from 'react';
import { useParams } from 'react-router-dom';

import { Button, InlineAlert, Skeleton } from '@/components/ui';
import { BuildsTable, BuildUploadModal } from '@/features/game-streaming';
import { useBuildsQuery } from '@/features/game-streaming';

export default function BuildsPage() {
  const { gameUuid } = useParams<{ gameUuid: string }>();
  const {
    data: builds,
    isLoading,
    isError,
    refetch,
  } = useBuildsQuery(gameUuid || '');
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-lg font-semibold">Builds</h2>
          <p className="text-muted-foreground text-sm">
            게임 실행 파일 패키지(.zip)를 업로드하고 상태를 확인합니다.
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
          <strong>Tip:</strong> ExecutablePath는 zip 내부 실행 파일의 상대
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
          <BuildsTable builds={builds} />
        </div>
      )}

      {/* Upload Modal */}
      {gameUuid && (
        <BuildUploadModal
          gameUuid={gameUuid}
          open={isUploadModalOpen}
          onOpenChange={setIsUploadModalOpen}
        />
      )}
    </div>
  );
}
