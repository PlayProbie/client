/**
 * BuildSelectionStep - 빌드 선택 단계
 * Step 1: 빌드 목록에서 READY 상태 빌드 선택
 */
import { Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

import { Button, InlineAlert, Skeleton } from '@/components/ui';
import type { Build } from '@/features/game-streaming';
import { useBuildsQuery } from '@/features/game-streaming';

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
  const navigate = useNavigate();
  const {
    data: builds,
    isLoading,
    isError,
    refetch,
  } = useBuildsQuery(gameUuid);

  const readyBuilds = (builds ?? []).filter(
    (build) => build.status === 'READY'
  );

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

  if (readyBuilds.length === 0) {
    return (
      <div className="space-y-4">
        <div>
          <h3 className="text-base font-semibold">빌드 선택</h3>
          <p className="text-muted-foreground text-sm">
            스트리밍에 사용할 빌드를 선택하세요.
          </p>
        </div>
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-12">
          <p className="text-muted-foreground mb-4 text-sm">
            READY 상태의 빌드가 없습니다.
          </p>
          <Button
            variant="outline"
            onClick={() => navigate(`/games/${gameUuid}/builds`)}
          >
            <Plus className="mr-2 size-4" />
            빌드 업로드하기
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-base font-semibold">빌드 선택</h3>
        <p className="text-muted-foreground text-sm">
          스트리밍에 사용할 빌드를 선택하세요.
        </p>
      </div>
      <div className="space-y-2">
        {readyBuilds.map((build) => (
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
    </div>
  );
}
