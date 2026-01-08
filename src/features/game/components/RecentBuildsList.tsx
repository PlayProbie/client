import { Link } from 'react-router-dom';

import { Skeleton } from '@/components/ui';

import { getBuildStatusClass } from '../utils';

// Note: Define Build type locally or import if available
interface BuildBase {
  uuid: string;
  filename?: string;
  version?: string;
  status: string;
}

interface RecentBuildsListProps {
  gameUuid: string | undefined;
  builds: BuildBase[] | undefined;
  isLoading: boolean;
}

/**
 * 최근 빌드 목록 컴포넌트
 */
export function RecentBuildsList({
  gameUuid,
  builds,
  isLoading,
}: RecentBuildsListProps) {
  if (isLoading) {
    return (
      <div className="bg-card rounded-lg border">
        <div className="bg-muted/50 border-b px-6 py-4">
          <Skeleton className="h-6 w-32" />
        </div>
        <div className="space-y-3 p-6">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
        </div>
      </div>
    );
  }

  return (
    <div className="bg-card rounded-lg border">
      <Link
        to={`/games/${gameUuid}/builds`}
        className="border-border hover:bg-muted/50 flex flex-col gap-1 border-b px-6 py-4 transition"
      >
        <div className="flex items-center justify-between">
          <h3 className="font-semibold">Recent Builds</h3>
          <span className="text-muted-foreground text-sm">전체 보기 →</span>
        </div>
      </Link>
      <div className="p-6">
        {!builds || builds.length === 0 ? (
          <div className="py-8 text-center">
            <p className="text-muted-foreground">
              아직 업로드된 빌드가 없습니다.
            </p>
            <Link
              to={`/games/${gameUuid}/builds`}
              className="text-primary mt-2 inline-block text-sm hover:underline"
            >
              첫 빌드 업로드하기 →
            </Link>
          </div>
        ) : (
          <div className="space-y-2">
            {builds.slice(0, 3).map((build) => (
              <div
                key={build.uuid}
                className="bg-muted/50 flex items-center justify-between rounded-lg px-4 py-3"
              >
                <div>
                  <span className="font-medium">
                    {build.filename || 'Unknown Build'}
                  </span>
                  {build.version && (
                    <span className="text-muted-foreground ml-2 text-xs">
                      v{build.version}
                    </span>
                  )}
                </div>
                <span className={getBuildStatusClass(build.status)}>
                  {build.status}
                </span>
              </div>
            ))}
            {builds.length > 3 && (
              <Link
                to={`/games/${gameUuid}/builds`}
                className="text-primary block pt-2 text-center text-sm hover:underline"
              >
                View all {builds.length} builds →
              </Link>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
