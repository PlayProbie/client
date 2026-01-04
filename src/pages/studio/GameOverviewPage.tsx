/**
 * GameOverviewPage - 게임 개요 페이지
 * Route: /studio/games/:gameUuid/overview
 */
import { FileArchive, Settings, Timer } from 'lucide-react';
import { Link, useParams } from 'react-router-dom';

import { Skeleton } from '@/components/ui/loading';
import { useBuildsQuery, useGameDetailQuery } from '@/features/game-streaming';

export default function GameOverviewPage() {
  const { gameUuid } = useParams<{ gameUuid: string }>();
  const { isLoading: isGameLoading } = useGameDetailQuery(gameUuid || '');
  const { data: builds, isLoading: isBuildsLoading } = useBuildsQuery(
    gameUuid || ''
  );

  const isLoading = isGameLoading || isBuildsLoading;
  const readyBuilds = builds?.filter((b) => b.status === 'READY').length || 0;
  const totalBuilds = builds?.length || 0;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold">Overview</h2>
        <p className="text-muted-foreground text-sm">
          게임 현황을 한눈에 확인하세요.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 sm:grid-cols-3">
        {/* Builds Card */}
        <Link
          to={`/studio/games/${gameUuid}/builds`}
          className="bg-card hover:bg-muted/50 rounded-lg border p-6 transition-colors"
        >
          <div className="flex items-center gap-4">
            <div className="bg-primary/10 rounded-lg p-3">
              <FileArchive className="text-primary size-6" />
            </div>
            <div>
              <p className="text-muted-foreground text-sm">Builds</p>
              {isLoading ? (
                <Skeleton className="mt-1 h-7 w-16" />
              ) : (
                <p className="text-2xl font-bold">
                  {readyBuilds}{' '}
                  <span className="text-muted-foreground text-sm font-normal">
                    / {totalBuilds}
                  </span>
                </p>
              )}
            </div>
          </div>
          <p className="text-muted-foreground mt-3 text-xs">
            {readyBuilds} builds ready for streaming
          </p>
        </Link>

        {/* Stream Settings Card */}
        <Link
          to={`/studio/games/${gameUuid}/stream-settings`}
          className="bg-card hover:bg-muted/50 rounded-lg border p-6 transition-colors"
        >
          <div className="flex items-center gap-4">
            <div className="bg-info/10 rounded-lg p-3">
              <Settings className="text-info size-6" />
            </div>
            <div>
              <p className="text-muted-foreground text-sm">Stream Settings</p>
              <p className="mt-1 text-lg font-semibold">Configure</p>
            </div>
          </div>
          <p className="text-muted-foreground mt-3 text-xs">
            GPU, resolution, and performance options
          </p>
        </Link>

        {/* Schedule Card */}
        <Link
          to={`/studio/games/${gameUuid}/schedule`}
          className="bg-card hover:bg-muted/50 rounded-lg border p-6 transition-colors"
        >
          <div className="flex items-center gap-4">
            <div className="bg-warning/10 rounded-lg p-3">
              <Timer className="text-warning size-6" />
            </div>
            <div>
              <p className="text-muted-foreground text-sm">Schedule</p>
              <p className="mt-1 text-lg font-semibold">Set Active Window</p>
            </div>
          </div>
          <p className="text-muted-foreground mt-3 text-xs">
            Configure when streaming is available
          </p>
        </Link>
      </div>

      {/* Recent Builds */}
      <div className="bg-card rounded-lg border">
        <div className="border-b px-6 py-4">
          <h3 className="font-semibold">Recent Builds</h3>
        </div>
        <div className="p-6">
          {isBuildsLoading ? (
            <div className="space-y-3">
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
            </div>
          ) : !builds || builds.length === 0 ? (
            <div className="py-8 text-center">
              <p className="text-muted-foreground">
                아직 업로드된 빌드가 없습니다.
              </p>
              <Link
                to={`/studio/games/${gameUuid}/builds`}
                className="text-primary mt-2 inline-block text-sm hover:underline"
              >
                첫 빌드 업로드하기 →
              </Link>
            </div>
          ) : (
            <div className="space-y-2">
              {builds.slice(0, 3).map((build) => (
                <div
                  key={build.buildId}
                  className="bg-muted/50 flex items-center justify-between rounded-lg px-4 py-3"
                >
                  <div>
                    <span className="font-medium">{build.filename}</span>
                    {build.version && (
                      <span className="text-muted-foreground ml-2 text-xs">
                        v{build.version}
                      </span>
                    )}
                  </div>
                  <span
                    className={
                      build.status === 'READY'
                        ? 'text-success'
                        : build.status === 'FAILED'
                          ? 'text-destructive'
                          : 'text-muted-foreground'
                    }
                  >
                    {build.status}
                  </span>
                </div>
              ))}
              {builds.length > 3 && (
                <Link
                  to={`/studio/games/${gameUuid}/builds`}
                  className="text-primary block pt-2 text-center text-sm hover:underline"
                >
                  View all {builds.length} builds →
                </Link>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
