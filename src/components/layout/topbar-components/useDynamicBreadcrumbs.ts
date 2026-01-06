import { generatePath, useLocation, useParams } from 'react-router-dom';

import { findNavItemByPath } from '@/config/navigation';
import { useGameDetailQuery } from '@/features/game-streaming/hooks';
import { useSurveys } from '@/features/game-streaming-survey';

interface Breadcrumb {
  label: string;
  to: string;
}

/**
 * Hook to get dynamic breadcrumbs based on current route.
 * Handles special cases like game detail pages where we need to fetch data.
 */
export function useDynamicBreadcrumbs(): {
  breadcrumbs: Breadcrumb[];
  isLoading: boolean;
} {
  const location = useLocation();
  const rawParams = useParams<{ gameUuid?: string; surveyUuid?: string }>();
  // route placeholder(':gameUuid', ':surveyUuid')가 아닌 유효한 UUID만 사용
  const params = {
    gameUuid:
      rawParams.gameUuid && !rawParams.gameUuid.startsWith(':')
        ? rawParams.gameUuid
        : undefined,
    surveyUuid:
      rawParams.surveyUuid && !rawParams.surveyUuid.startsWith(':')
        ? rawParams.surveyUuid
        : undefined,
  };
  const pathname = location.pathname;

  const isGameRoute = pathname.startsWith('/games/') && !!params.gameUuid;
  const isSurveyRoute = isGameRoute && pathname.includes('/surveys');
  const isSurveyDetailRoute = isSurveyRoute && !!params.surveyUuid;

  const { data: game, isLoading: isGameLoading } = useGameDetailQuery(
    params.gameUuid || '',
    { enabled: isGameRoute }
  );
  const { data: surveys, isLoading: isSurveyLoading } = useSurveys({
    gameUuid: params.gameUuid,
    enabled: isSurveyRoute && !!params.gameUuid,
  });
  const survey = surveys?.find((item) => item.surveyUuid === params.surveyUuid);

  // Get static breadcrumbs from navigation config
  const { breadcrumbs: staticBreadcrumbs } = findNavItemByPath(
    location.pathname
  );
  const resolveNavPath = (path: string) => {
    if (!params.gameUuid) return path;
    return path.includes(':gameUuid')
      ? generatePath(path, { gameUuid: params.gameUuid })
      : path;
  };
  const resolvedStaticBreadcrumbs = staticBreadcrumbs.map((crumb) => ({
    ...crumb,
    to: resolveNavPath(crumb.to),
  }));

  if (isGameRoute) {
    const gameLabel = isGameLoading ? '' : game?.gameName || 'Unknown Game';
    const gameCrumb: Breadcrumb = {
      label: gameLabel,
      to: `/games/${params.gameUuid}`,
    };

    if (isSurveyDetailRoute) {
      const surveyLabel = isSurveyLoading
        ? ''
        : survey?.surveyName || '설문 상세';

      const pathParts = pathname.split('/');
      const currentTab = pathParts[pathParts.length - 1];
      const isDesignStep = pathname.includes('/design/');

      const tabLabels: Record<string, string> = {
        overview: '개요',
        distribute: '배포/연동',
        analyze: '결과/인사이트',
      };
      const tabLabel = isDesignStep ? '설문 설계' : tabLabels[currentTab] || '';

      const breadcrumbList: Breadcrumb[] = [
        gameCrumb,
        { label: '설문 관리', to: `/games/${params.gameUuid}/surveys` },
        {
          label: surveyLabel,
          to: `/games/${params.gameUuid}/surveys/${params.surveyUuid}/overview`,
        },
      ];

      if (tabLabel && currentTab !== 'overview') {
        breadcrumbList.push({ label: tabLabel, to: '' });
      }

      return {
        breadcrumbs: breadcrumbList,
        isLoading: isGameLoading || isSurveyLoading,
      };
    }

    if (isSurveyRoute) {
      const isDesignRoute = pathname.includes('/surveys/design/');
      const breadcrumbList: Breadcrumb[] = [
        gameCrumb,
        {
          label: '설문 관리',
          to: `/games/${params.gameUuid}/surveys`,
        },
      ];

      if (isDesignRoute) {
        breadcrumbList.push({ label: '설문 설계', to: '' });
      }

      return {
        breadcrumbs: breadcrumbList,
        isLoading: isGameLoading,
      };
    }

    const finalStatic =
      resolvedStaticBreadcrumbs.length > 0
        ? resolvedStaticBreadcrumbs
        : [{ label: gameLabel, to: '' }];

    return {
      breadcrumbs: [gameCrumb, ...finalStatic],
      isLoading: isGameLoading,
    };
  }

  return { breadcrumbs: staticBreadcrumbs, isLoading: false };
}
