/**
 * BuildSelectionStep - 빌드 선택 단계
 * Step 1: 빌드 목록에서 UPLOADED 상태 빌드 선택
 */
import { Plus } from 'lucide-react';
import { useState } from 'react';

import { Button, InlineAlert, Skeleton } from '@/components/ui';
import { useGameDetailQuery } from '@/features/game';
import type { Build } from '@/features/game-streaming';
import { BuildUploadModal, useBuildsQuery } from '@/features/game-streaming';

interface BuildSelectionStepProps {
  gameUuid: string;
  onSelectBuild: (build: Build) => void;
}

function BuildSelectionSkeleton() {
  return (
    <div className="space-y-2">
      <Skeleton className="h-16 w-full" />
      <Skeleton className="h-16 w-full" />
      <Skeleton className="h-16 w-full" />
    </div>
  );
}

export function BuildSelectionStep({
  gameUuid,
  onSelectBuild,
}: BuildSelectionStepProps) {
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const { data: game } = useGameDetailQuery(gameUuid);
  const {
    data: builds,
    isLoading,
    isError,
    refetch,
  } = useBuildsQuery(gameUuid);

  const uploadedBuilds = (builds ?? []).filter(
    (build) => build.status === 'UPLOADED'
  );

  const handleUploadModalClose = (open: boolean) => {
    setIsUploadModalOpen(open);
    if (!open) {
      // Refetch builds when modal closes (upload may have completed)
      refetch();
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div>
          <h3 className="text-base font-semibold">빌드 선택</h3>
          <p className="text-muted-foreground text-sm">
            스트리밍에 사용할 빌드를 선택하세요.
          </p>
        </div>
        <BuildSelectionSkeleton />
      </div>
    );
  }

  if (isError) {
    return (
      <InlineAlert
        variant="error"
        title="빌드 목록 로딩 실패"
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
    );
  }

  if (uploadedBuilds.length === 0) {
    return (
      <div className="space-y-4">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-base font-semibold">빌드 선택</h3>
            <p className="text-muted-foreground text-sm">
              스트리밍에 사용할 빌드를 선택하세요.
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsUploadModalOpen(true)}
          >
            <Plus className="mr-2 size-4" />
            빌드 업로드하기
          </Button>
        </div>
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-12">
          <p className="text-muted-foreground mb-4 text-sm">
            UPLOADED 상태의 빌드가 없습니다.
          </p>
          <Button
            variant="outline"
            onClick={() => setIsUploadModalOpen(true)}
          >
            <Plus className="mr-2 size-4" />
            빌드 업로드하기
          </Button>
        </div>
        <BuildUploadModal
          gameUuid={gameUuid}
          gameName={game?.gameName ?? 'Unknown Game'}
          open={isUploadModalOpen}
          onOpenChange={handleUploadModalClose}
        />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between">
        <div>
          <h3 className="text-base font-semibold">빌드 선택</h3>
          <p className="text-muted-foreground text-sm">
            스트리밍에 사용할 빌드를 선택하세요.
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setIsUploadModalOpen(true)}
        >
          <Plus className="mr-2 size-4" />
          빌드 업로드하기
        </Button>
      </div>
      <div className="space-y-2">
        {uploadedBuilds.map((build) => (
          <button
            key={build.uuid}
            type="button"
            className="hover:border-primary hover:bg-muted/50 flex w-full items-center justify-between rounded-lg border p-4 text-left transition-colors"
            onClick={() => onSelectBuild(build)}
          >
            <div>
              <p className="font-medium">{build.filename}</p>
              {build.version && (
                <p className="text-muted-foreground text-sm">
                  v{build.version}
                </p>
              )}
            </div>
            <span className="text-muted-foreground text-sm">
              {new Date(build.createdAt).toLocaleDateString('ko-KR')}
            </span>
          </button>
        ))}
      </div>
      <BuildUploadModal
        gameUuid={gameUuid}
        gameName={game?.gameName ?? 'Unknown Game'}
        open={isUploadModalOpen}
        onOpenChange={handleUploadModalClose}
      />
    </div>
  );
}
