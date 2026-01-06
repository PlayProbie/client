import { Check, Copy, Lock } from 'lucide-react';
import { useState } from 'react';
import { NavLink, Outlet, useParams } from 'react-router-dom';

import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/loading';
import { SURVEY_STATUS_CONFIG, SURVEY_TABS } from '@/config/navigation';
import { useSurveys } from '@/features/game-streaming-survey';
import type { Survey } from '@/features/game-streaming-survey/types';
import { cn } from '@/lib/utils';

export interface SurveyShellContext {
  survey?: Survey;
  gameUuid?: string;
  surveyUuid?: string;
  isLoading: boolean;
  isError: boolean;
  refetch: () => void;
}

export function SurveyShell() {
  const { gameUuid: routeGameUuid, surveyUuid: routeSurveyUuid } = useParams<{
    gameUuid: string;
    surveyUuid: string;
  }>();
  // route placeholder(':gameUuid', ':surveyUuid')가 아닌 유효한 UUID만 사용
  const gameUuid =
    routeGameUuid && !routeGameUuid.startsWith(':') ? routeGameUuid : undefined;
  const surveyUuid =
    routeSurveyUuid && !routeSurveyUuid.startsWith(':')
      ? routeSurveyUuid
      : undefined;
  const {
    data: surveys,
    isLoading,
    isError,
    refetch,
  } = useSurveys({
    gameUuid,
    enabled: !!gameUuid,
  });
  const survey = surveys?.find((item) => item.surveyUuid === surveyUuid);
  const statusConfig = survey ? SURVEY_STATUS_CONFIG[survey.status] : null;
  const [copied, setCopied] = useState(false);

  const handleCopySurveyId = async () => {
    if (!surveyUuid) return;
    await navigator.clipboard.writeText(surveyUuid);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const contextValue: SurveyShellContext = {
    survey,
    gameUuid,
    surveyUuid,
    isLoading,
    isError,
    refetch,
  };

  return (
    <div className="flex h-full flex-col">
      <div className="bg-background border-b px-6 py-4">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">
              {isLoading ? (
                <Skeleton className="h-8 w-60" />
              ) : (
                survey?.surveyName || '설문 상세'
              )}
            </h1>
            <div className="text-muted-foreground mt-2 flex items-center gap-2 text-sm">
              <span>UUID:</span>
              <code className="bg-muted rounded px-2 py-0.5 font-mono text-xs">
                {surveyUuid || '-'}
              </code>
              <Button
                variant="ghost"
                size="icon"
                className="size-6"
                onClick={handleCopySurveyId}
                disabled={!surveyUuid}
                title="Copy Survey UUID"
              >
                {copied ? (
                  <Check className="text-success size-3" />
                ) : (
                  <Copy className="size-3" />
                )}
              </Button>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {isLoading ? (
              <Skeleton className="h-6 w-24" />
            ) : statusConfig ? (
              <span
                className={cn(
                  'rounded-full px-3 py-1 text-xs font-medium',
                  statusConfig.color
                )}
              >
                {statusConfig.label}
              </span>
            ) : null}
          </div>
        </div>

        <nav className="mt-4 flex flex-wrap gap-1">
          {SURVEY_TABS.map((tab) => {
            const isLocked =
              tab.editableOnlyInDraft &&
              survey?.status &&
              survey.status !== 'DRAFT';
            const tabContent = (
              <>
                <tab.icon className="size-4" />
                <span>{tab.label}</span>
                {isLocked && <Lock className="size-3 opacity-70" />}
              </>
            );

            const tabClasses =
              'flex items-center gap-2 rounded-t-md px-4 py-2 text-sm font-medium transition-colors';

            if (isLocked) {
              return (
                <span
                  key={tab.path}
                  className={cn(
                    tabClasses,
                    'bg-muted/50 text-muted-foreground cursor-not-allowed'
                  )}
                  aria-disabled="true"
                  title="진행 중/종료된 설문은 문항을 수정할 수 없습니다."
                >
                  {tabContent}
                </span>
              );
            }

            const navTo =
              tab.path === 'design' ? `${tab.path}/step-0` : tab.path;
            return (
              <NavLink
                key={tab.path}
                to={navTo}
                className={({ isActive }) =>
                  cn(
                    tabClasses,
                    isActive
                      ? 'bg-primary text-primary-foreground'
                      : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                  )
                }
              >
                {tabContent}
              </NavLink>
            );
          })}
        </nav>
      </div>

      <div className="flex-1 overflow-auto p-6">
        <Outlet context={contextValue} />
      </div>
    </div>
  );
}
