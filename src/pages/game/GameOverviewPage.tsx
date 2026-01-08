import { ClipboardList, FileArchive, List } from 'lucide-react';
import { Link, useParams } from 'react-router-dom';

import { Button } from '@/components/ui';
import {
  GameOverviewCard,
  RecentBuildsList,
  useGameDetailQuery,
  useSurveyStats,
} from '@/features/game';
import { useBuildsQuery } from '@/features/game-streaming';
import { useSurveys } from '@/features/game-streaming-survey';

export default function GameOverviewPage() {
  const { gameUuid: routeGameUuid } = useParams<{ gameUuid: string }>();
  // route placeholder(':gameUuid')가 아닌 유효한 UUID만 사용
  const gameUuid =
    routeGameUuid && !routeGameUuid.startsWith(':') ? routeGameUuid : undefined;

  // Queries
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

  // Derived State
  const isLoading = isGameLoading || isBuildsLoading;
  const readyBuilds = builds?.filter((b) => b.status === 'READY').length || 0;
  const totalBuilds = builds?.length || 0;
  const surveyStats = useSurveyStats(surveys);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">Overview</h2>
          <p className="text-muted-foreground text-sm">
            게임 현황을 한눈에 확인하세요.
          </p>
        </div>
        <Button
          variant="outline"
          asChild
        >
          <Link to="/games">
            <List className="mr-2 size-4" />
            게임 목록
          </Link>
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {/* Builds Card */}
        <GameOverviewCard
          title="Builds"
          icon={<FileArchive className="text-primary size-6" />}
          iconClassName="bg-primary/10"
          mainValue={
            <>
              {readyBuilds}{' '}
              <span className="text-muted-foreground text-sm font-normal">
                / {totalBuilds}
              </span>
            </>
          }
          actionUrl={`/games/${gameUuid}/builds`}
          actionLabel="빌드 저장소 보기"
          isLoading={isLoading}
        >
          <p className="text-muted-foreground mt-4 text-sm">
            준비된 빌드 {readyBuilds}개 · 전체 {totalBuilds}개
          </p>
        </GameOverviewCard>

        {/* Surveys Card */}
        <GameOverviewCard
          title="Surveys"
          icon={<ClipboardList className="text-secondary size-6" />}
          iconClassName="bg-secondary/10"
          mainValue={surveyStats.totalSurveys}
          actionUrl={`/games/${gameUuid}/surveys`}
          actionLabel="설문 관리"
          isLoading={isSurveysLoading}
        >
          <div className="mt-4 grid gap-3 sm:grid-cols-3">
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
          </div>
          {isSurveysError && (
            <p className="text-destructive mt-4 text-sm">
              설문 정보를 불러오는 동안 오류가 발생했습니다.
            </p>
          )}
        </GameOverviewCard>
      </div>

      {/* Recent Builds */}
      <RecentBuildsList
        gameUuid={gameUuid}
        builds={builds}
        isLoading={isBuildsLoading}
      />
    </div>
  );
}
