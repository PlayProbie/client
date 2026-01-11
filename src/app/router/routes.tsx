import { lazy, Suspense } from 'react';
import { createBrowserRouter, Navigate, redirect } from 'react-router-dom';

import { PageSpinner } from '@/components/ui';
import { getStreamingGames } from '@/features/game-streaming/api';
import { SurveyShell } from '@/features/survey';

import { AuthLayout, GuestLayout, RootLayout } from './layouts';

// =============================================================================
// Lazy Loading: 페이지 컴포넌트
// =============================================================================

// Auth 페이지
const LoginPage = lazy(() => import('@/pages/auth/LoginPage'));
const RegisterPage = lazy(() => import('@/pages/auth/RegisterPage'));

// Game 페이지
const GamesListPage = lazy(() => import('@/pages/game/GamesListPage'));
const GameOverviewPage = lazy(() => import('@/pages/game/GameOverviewPage'));

// Studio 페이지
const BuildsPage = lazy(() => import('@/pages/studio/BuildsPage'));
const StreamSettingsPage = lazy(
  () => import('@/pages/studio/StreamSettingsPage')
);
const SurveyListPage = lazy(() => import('@/pages/studio/SurveyListPage'));

// Survey 페이지
const SurveyAnalyticsPage = lazy(
  () => import('@/pages/survey/SurveyAnalyticsPage')
);
const SurveyDesignPage = lazy(() => import('@/pages/survey/SurveyDesignPage'));
const SurveyDistributePage = lazy(
  () => import('@/pages/survey/SurveyDistributePage')
);
const SurveyOverviewPage = lazy(
  () => import('@/pages/survey/SurveyOverviewPage')
);
const SurveySessionPage = lazy(
  () => import('@/pages/survey/SurveySessionPage')
);
const SurveySessionStartPage = lazy(
  () => import('@/pages/survey/SurveySessionStartPage')
);
const SurveySessionCompletePage = lazy(
  () => import('@/pages/survey/SurveySessionCompletePage')
);

// Play 페이지
const QueuePage = lazy(() => import('@/pages/play/QueuePage'));
const StreamingPlayPage = lazy(() => import('@/pages/play/StreamingPlayPage'));
import { QueuePageSkeleton } from '@/features/game-streaming-session';
// 404 페이지 (작은 번들이므로 정적 import)
import NotFoundPage from '@/pages/NotFoundPage';

// =============================================================================
// Preload: 자주 사용되는 라우트를 미리 로드
// =============================================================================

/**
 * 페이지 컴포넌트를 미리 로드하는 유틸리티
 * 네비게이션 hover 시 또는 특정 조건에서 호출
 */
export const preloadRoutes = {
  // Game 관련
  gamesListPage: () => import('@/pages/game/GamesListPage'),
  gameOverviewPage: () => import('@/pages/game/GameOverviewPage'),

  // Studio 관련
  buildsPage: () => import('@/pages/studio/BuildsPage'),
  streamSettingsPage: () => import('@/pages/studio/StreamSettingsPage'),
  surveyListPage: () => import('@/pages/studio/SurveyListPage'),

  // Survey 관련
  surveyOverviewPage: () => import('@/pages/survey/SurveyOverviewPage'),
  surveyDesignPage: () => import('@/pages/survey/SurveyDesignPage'),
  surveyDistributePage: () => import('@/pages/survey/SurveyDistributePage'),
  surveyAnalyticsPage: () => import('@/pages/survey/SurveyAnalyticsPage'),

  // Play/Tester 관련
  queuePage: () => import('@/pages/play/QueuePage'),
  streamingPlayPage: () => import('@/pages/play/StreamingPlayPage'),
  surveySessionPage: () => import('@/pages/survey/SurveySessionPage'),
  surveySessionStartPage: () => import('@/pages/survey/SurveySessionStartPage'),
  surveySessionCompletePage: () =>
    import('@/pages/survey/SurveySessionCompletePage'),

  // Auth 관련
  loginPage: () => import('@/pages/auth/LoginPage'),
  registerPage: () => import('@/pages/auth/RegisterPage'),
};

/**
 * 라우트 경로를 기반으로 해당 페이지를 preload
 */
export function preloadByPath(path: string): void {
  // 로그인된 사용자를 위한 메인 페이지들
  if (path.includes('/games') && path.includes('/overview')) {
    preloadRoutes.gameOverviewPage();
  } else if (path.includes('/games') && path.includes('/builds')) {
    preloadRoutes.buildsPage();
  } else if (path.includes('/games') && path.includes('/stream-settings')) {
    preloadRoutes.streamSettingsPage();
  } else if (path.includes('/surveys') && path.includes('/design')) {
    preloadRoutes.surveyDesignPage();
  } else if (path.includes('/surveys') && path.includes('/distribute')) {
    preloadRoutes.surveyDistributePage();
  } else if (path.includes('/surveys') && path.includes('/analyze')) {
    preloadRoutes.surveyAnalyticsPage();
  } else if (path.includes('/surveys') && path.includes('/overview')) {
    preloadRoutes.surveyOverviewPage();
  } else if (path.includes('/games') && path.includes('/surveys')) {
    preloadRoutes.surveyListPage();
  } else if (path === '/games' || path.endsWith('/games')) {
    preloadRoutes.gamesListPage();
  }
  // Play/Tester 페이지
  else if (path.includes('/play/queue/')) {
    preloadRoutes.queuePage();
  } else if (path.includes('/play/')) {
    preloadRoutes.streamingPlayPage();
  } else if (path.includes('/surveys/session/sessions')) {
    preloadRoutes.surveySessionPage();
  } else if (path.includes('/surveys/session/')) {
    preloadRoutes.surveySessionStartPage();
  }
  // Auth 페이지
  else if (path === '/login') {
    preloadRoutes.loginPage();
  } else if (path === '/auth/register') {
    preloadRoutes.registerPage();
  }
}

/**
 * 인증된 사용자의 메인 라우트들을 일괄 preload
 * AuthGuard에서 로그인 성공 후 호출 가능
 */
export function preloadAuthenticatedRoutes(): void {
  preloadRoutes.gamesListPage();
  preloadRoutes.gameOverviewPage();
  preloadRoutes.surveyListPage();
}

// =============================================================================
// Suspense Wrapper: 로딩 상태 처리
// =============================================================================

function withSuspense(
  component: React.LazyExoticComponent<React.ComponentType>
) {
  return (
    <Suspense fallback={<PageSpinner message="페이지를 불러오는 중..." />}>
      {/* Render lazy component */}
      {(() => {
        const LazyComponent = component;
        return <LazyComponent />;
      })()}
    </Suspense>
  );
}

// =============================================================================
// Router Loader
// =============================================================================

const redirectToDefaultGame = async () => {
  try {
    const games = await getStreamingGames();
    if (games.length) {
      return redirect(`/games/${games[0].gameUuid}/overview`);
    }
  } catch {
    // ignore
  }

  return redirect('/games');
};

// =============================================================================
// Router Configuration
// =============================================================================

export const router = createBrowserRouter([
  {
    element: <RootLayout />,
    children: [
      // ============================================
      // 인증 필요 경로
      // ============================================
      {
        element: <AuthLayout />,
        children: [
          // '/' -> '/games' or '/games/:gameUuid'
          {
            index: true,
            loader: redirectToDefaultGame,
          },

          // 게임 목록
          { path: '/games', element: withSuspense(GamesListPage) },

          {
            path: '/games/:gameUuid',
            element: (
              <Navigate
                to="overview"
                replace
              />
            ),
          },
          {
            path: '/games/:gameUuid/overview',
            element: withSuspense(GameOverviewPage),
          },

          // 빌드 저장소
          {
            path: '/games/:gameUuid/builds',
            element: withSuspense(BuildsPage),
          },

          // 스트리밍 설정
          {
            path: '/games/:gameUuid/stream-settings',
            element: withSuspense(StreamSettingsPage),
          },

          // 설문 목록
          {
            path: '/games/:gameUuid/surveys',
            element: withSuspense(SurveyListPage),
          },

          // 설문 설계
          {
            path: '/games/:gameUuid/surveys/design',
            loader: ({ params }) =>
              params.gameUuid
                ? redirect(`/games/${params.gameUuid}/surveys/design/step-0`)
                : redirect('/games'),
          },
          {
            path: '/games/:gameUuid/surveys/design/:step',
            element: withSuspense(SurveyDesignPage),
          },

          // 설문 상세
          {
            path: '/games/:gameUuid/surveys/:surveyUuid',
            element: <SurveyShell />,
            children: [
              {
                index: true,
                element: (
                  <Navigate
                    to="overview"
                    replace
                  />
                ),
              },
              { path: 'overview', element: withSuspense(SurveyOverviewPage) },
              {
                path: 'design',
                element: (
                  <Navigate
                    to="step-0"
                    replace
                  />
                ),
              },
              {
                path: 'design/:step',
                element: withSuspense(SurveyDesignPage),
              },
              {
                path: 'distribute',
                element: withSuspense(SurveyDistributePage),
              },
              { path: 'analyze', element: withSuspense(SurveyAnalyticsPage) },
            ],
          },
        ],
      },

      // ============================================
      // PUBLIC 경로
      // ============================================

      // 테스터 Experience - 대기열 페이지
      {
        path: '/play/queue/:surveyUuid',
        element: (
          <Suspense fallback={<QueuePageSkeleton />}>
            <QueuePage />
          </Suspense>
        ),
      },

      // 테스터 Experience - 온라인 스트리밍
      {
        path: '/play/:surveyUuid',
        element: withSuspense(StreamingPlayPage),
      },

      // 설문 세션 - interview / chat
      {
        path: '/surveys/session',
        children: [
          {
            path: 'complete',
            element: withSuspense(SurveySessionCompletePage),
          },
          {
            path: ':surveyUuid',
            element: withSuspense(SurveySessionStartPage),
          },
          {
            path: 'sessions/:sessionUuid',
            element: withSuspense(SurveySessionPage),
          },
        ],
      },

      // 로그인
      {
        element: <GuestLayout />,
        children: [
          { path: '/login', element: withSuspense(LoginPage) },
          { path: '/auth/register', element: withSuspense(RegisterPage) },
        ],
      },

      // 404 페이지 (정적 import - 빠른 렌더링 필요)
      { path: '*', element: <NotFoundPage /> },
    ],
  },
]);
