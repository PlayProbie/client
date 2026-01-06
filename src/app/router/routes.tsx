import { createBrowserRouter, Navigate, redirect } from 'react-router-dom';

import { getStreamingGames } from '@/features/game-streaming/api';
import { SurveyShell } from '@/features/survey';
import LoginPage from '@/pages/auth/LoginPage';
import RegisterPage from '@/pages/auth/RegisterPage';
import NotFoundPage from '@/pages/NotFoundPage';
import TesterPlaceholderPage from '@/pages/play/TesterPlaceholderPage';
import BuildsPage from '@/pages/studio/BuildsPage';
import GameOverviewPage from '@/pages/studio/GameOverviewPage';
import GamesListPage from '@/pages/studio/GamesListPage';
import StreamSettingsPage from '@/pages/studio/StreamSettingsPage';
import SurveyListPage from '@/pages/studio/SurveyListPage';
import SurveyAnalyticsPage from '@/pages/survey/SurveyAnalyticsPage';
import SurveyDesignPage from '@/pages/survey/SurveyDesignPage';
import SurveyDistributePage from '@/pages/survey/SurveyDistributePage';
import SurveyOverviewPage from '@/pages/survey/SurveyOverviewPage';
import SurveySessionPage from '@/pages/survey/SurveySessionPage';
import SurveySessionStartPage from '@/pages/survey/SurveySessionStartPage';

import { AuthLayout, GuestLayout, RootLayout } from './layouts';
import LegacyStudioRedirect from './LegacyStudioRedirect';

const redirectToDefaultGame = async () => {
  try {
    const games = await getStreamingGames();
    if (games.length) {
      return redirect(`/games/${games[0].gameUuid}`);
    }
  } catch {
    // ignore
  }

  return redirect('/games');
};

// ============================================
// Survey Control Tower 페이지
// 기본 구조만 구성하고 탭별 상세 화면은 단계별로 확장
// ============================================

export const router = createBrowserRouter([
  {
    element: <RootLayout />,
    children: [
      // 인증이 필요한 라우트
      {
        element: <AuthLayout />,
        children: [
          // ============================================
          // [NEW] 워크스페이스 → 게임 선택 흐름
          // ============================================
          {
            index: true,
            loader: redirectToDefaultGame,
          },

          // 게임 목록 (새 경로)
          { path: '/games', element: <GamesListPage /> },

          {
            path: '/games/:gameUuid/overview',
            loader: ({ params }) =>
              params.gameUuid
                ? redirect(`/games/${params.gameUuid}`)
                : redirect('/games'),
          },
          { path: '/games/:gameUuid', element: <GameOverviewPage /> },

          // 게임 대시보드 Shell + 탭 (새 경로)
          // {
          //   path: '/games/:gameUuid',
          //   element: <GameShell />,
          //   children: [
          //     {
          //       index: true,
          //       element: (
          //         <Navigate
          //           to="overview"
          //           replace
          //         />
          //       ),
          //     },
          //     { path: 'overview', element: <GameOverviewPage /> },
          //     { path: 'builds', element: <BuildsPage /> },
          //     { path: 'stream-settings', element: <StreamSettingsPage /> },
          //   ],
          // },

          { path: '/games/:gameUuid/surveys', element: <SurveyListPage /> },
          {
            path: '/games/:gameUuid/surveys/design',
            loader: ({ params }) =>
              params.gameUuid
                ? redirect(`/games/${params.gameUuid}/surveys/design/step-0`)
                : redirect('/games'),
          },
          {
            path: '/games/:gameUuid/surveys/design/step-:step',
            element: <SurveyDesignPage />,
          },
          { path: '/games/:gameUuid/builds', element: <BuildsPage /> },
          {
            path: '/games/:gameUuid/stream-settings',
            element: <StreamSettingsPage />,
          },

          // ============================================
          // [NEW] Survey Control Tower (게임 종속 설문 상세)
          // 4개 탭: overview, design, distribute, analyze
          // ============================================
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
              { path: 'overview', element: <SurveyOverviewPage /> },
              {
                path: 'design',
                loader: () => redirect('step-0'),
              },
              {
                path: 'design/step-:step',
                element: <SurveyDesignPage />,
              },
              { path: 'distribute', element: <SurveyDistributePage /> },
              { path: 'analyze', element: <SurveyAnalyticsPage /> },
            ],
          },

          // ============================================
          // [LEGACY] Creator Studio - 새 경로로 리다이렉트
          // ============================================
          {
            path: '/studio',
            element: (
              <Navigate
                to="/games"
                replace
              />
            ),
          },
          { path: '/studio/games/*', element: <LegacyStudioRedirect /> },

          // ============================================
          // [LEGACY] 설문 관리 - 기존 독립 경로 유지
          // ============================================
          {
            path: '/survey',
            element: (
              <Navigate
                to="/survey/design/step-0"
                replace
              />
            ),
          },
          {
            path: '/survey/design',
            element: (
              <Navigate
                to="/survey/design/step-0"
                replace
              />
            ),
          },
          { path: '/survey/design/:step', element: <SurveyDesignPage /> },
          {
            path: '/survey/analytics/:gameUuid',
            element: <SurveyAnalyticsPage />,
          },
        ],
      },

      // ============================================
      // [PUBLIC] 테스터 Experience - 온라인 스트리밍
      // ============================================
      { path: '/play/:surveyUuid', element: <TesterPlaceholderPage /> },

      // ============================================
      // [PUBLIC] 설문 세션 (기존 유지)
      // ============================================
      {
        path: '/surveys/session',
        children: [
          { path: ':surveyUuid', element: <SurveySessionStartPage /> },
          { path: 'sessions/:sessionUuid', element: <SurveySessionPage /> },
        ],
      },

      // [STASH] Screen G: Tester Placeholder
      // { path: '/play/:gameUuid', element: <TesterPlaceholderPage /> },

      // 비인증 사용자 전용 라우트
      {
        element: <GuestLayout />,
        children: [
          { path: '/login', element: <LoginPage /> },
          { path: '/auth/register', element: <RegisterPage /> },
        ],
      },

      // 404 페이지
      { path: '*', element: <NotFoundPage /> },
    ],
  },
]);
