import { ClipboardList, FileArchive } from 'lucide-react';
import { useMemo } from 'react';
import { Link, useParams } from 'react-router-dom';

import { Button, Skeleton } from '@/components/ui';
import { useBuildsQuery, useGameDetailQuery } from '@/features/game-streaming';
import { useSurveys } from '@/features/game-streaming-survey';

export default function GameOverviewPage() {
  const { gameUuid: routeGameUuid } = useParams<{ gameUuid: string }>();
  // route placeholder(':gameUuid')가 아닌 유효한 UUID만 사용
  const gameUuid =
    routeGameUuid && !routeGameUuid.startsWith(':') ? routeGameUuid : undefined;
  const { isLoading: isGameLoading } = useGameDetailQuery(gameUuid || '');
  const { data: builds, isLoading: isBuildsLoading } = useBuildsQuery(
    gameUuid || ''
  );
  const {
    data: surveys,
    isLoading: isSurveysLoading,
    isError: isSurveysError,
  } = useSurveys({
    gameUuid,
    enabled: !!gameUuid,
  });

  const isLoading = isGameLoading || isBuildsLoading;
  const readyBuilds = builds?.filter((b) => b.status === 'READY').length || 0;
  const totalBuilds = builds?.length || 0;

  const surveyStats = useMemo(() => {
    if (!surveys || surveys.length === 0) {
      return {
        totalSurveys: 0,
        activeSurveys: 0,
        draftSurveys: 0,
        latestLabel: '등록된 설문이 없습니다.',
      };
    }

    const latestSurvey = surveys.reduce((latest, survey) =>
      new Date(survey.createdAt) > new Date(latest.createdAt) ? survey : latest
    );

    return {
      totalSurveys: surveys.length,
      activeSurveys: surveys.filter((survey) => survey.status === 'ACTIVE')
        .length,
      draftSurveys: surveys.filter((survey) => survey.status === 'DRAFT')
        .length,
      latestLabel: `${latestSurvey.surveyName} · ${new Date(
        latestSurvey.createdAt
      ).toLocaleDateString()}`,
    };
  }, [surveys]);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold">Overview</h2>
        <p className="text-muted-foreground text-sm">
          게임 현황을 한눈에 확인하세요.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="bg-card rounded-xl border p-6 shadow-sm">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="bg-primary/10 rounded-lg p-3">
                <FileArchive className="text-primary size-6" />
              </div>
              <div>
                <p className="text-muted-foreground text-sm">Builds</p>
                {isLoading ? (
                  <Skeleton className="mt-1 h-7 w-24" />
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
            <Button
              variant="outline"
              size="sm"
              asChild
            >
              <Link to={`/games/${gameUuid}/builds`}>빌드 저장소 보기</Link>
            </Button>
          </div>
          <p className="text-muted-foreground mt-4 text-sm">
            준비된 빌드 {readyBuilds}개 · 전체 {totalBuilds}개
          </p>
        </div>

        <div className="bg-card rounded-xl border p-6 shadow-sm">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="bg-secondary/10 rounded-lg p-3">
                <ClipboardList className="text-secondary size-6" />
              </div>
              <div>
                <p className="text-muted-foreground text-sm">Surveys</p>
                {isSurveysLoading ? (
                  <Skeleton className="mt-1 h-7 w-24" />
                ) : (
                  <p className="text-2xl font-bold">
                    {surveyStats.totalSurveys}
                  </p>
                )}
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              asChild
            >
              <Link to={`/games/${gameUuid}/surveys`}>설문 관리</Link>
            </Button>
          </div>
          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            {isSurveysLoading ? (
              Array.from({ length: 3 }).map((_, idx) => (
                <Skeleton
                  key={`survey-skel-${idx}`}
                  className="h-10"
                />
              ))
            ) : (
              <>
                <div>
                  <p className="text-muted-foreground text-xs">Active</p>
                  <p className="text-lg font-semibold">
                    {surveyStats.activeSurveys}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground text-xs">Draft</p>
                  <p className="text-lg font-semibold">
                    {surveyStats.draftSurveys}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground text-xs">Latest</p>
                  <p className="text-muted-foreground text-sm font-medium">
                    {surveyStats.latestLabel}
                  </p>
                </div>
              </>
            )}
          </div>
          {isSurveysError && (
            <p className="text-destructive mt-4 text-sm">
              설문 정보를 불러오는 동안 오류가 발생했습니다.
            </p>
          )}
        </div>
      </div>

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
    </div>
  );
}
