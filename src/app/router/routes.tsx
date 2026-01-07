import { createBrowserRouter, Navigate, redirect } from 'react-router-dom';

import { getStreamingGames } from '@/features/game-streaming/api';
import { SurveyShell } from '@/features/survey';
import LoginPage from '@/pages/auth/LoginPage';
import RegisterPage from '@/pages/auth/RegisterPage';
import GameOverviewPage from '@/pages/game/GameOverviewPage';
import GamesListPage from '@/pages/game/GamesListPage';
import NotFoundPage from '@/pages/NotFoundPage';
import TesterPlaceholderPage from '@/pages/play/TesterPlaceholderPage';
import BuildsPage from '@/pages/studio/BuildsPage';
import StreamSettingsPage from '@/pages/studio/StreamSettingsPage';
import SurveyListPage from '@/pages/studio/SurveyListPage';
import SurveyAnalyticsPage from '@/pages/survey/SurveyAnalyticsPage';
import SurveyDesignPage from '@/pages/survey/SurveyDesignPage';
import SurveyDistributePage from '@/pages/survey/SurveyDistributePage';
import SurveyOverviewPage from '@/pages/survey/SurveyOverviewPage';
import SurveySessionPage from '@/pages/survey/SurveySessionPage';
import SurveySessionStartPage from '@/pages/survey/SurveySessionStartPage';

import { AuthLayout, GuestLayout, RootLayout } from './layouts';

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
          { path: '/games', element: <GamesListPage /> },

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
            element: <GameOverviewPage />,
          },

          // 빌드 저장소
          { path: '/games/:gameUuid/builds', element: <BuildsPage /> },

          // 스트리밍 설정
          {
            path: '/games/:gameUuid/stream-settings',
            element: <StreamSettingsPage />,
          },

          // 설문 목록
          { path: '/games/:gameUuid/surveys', element: <SurveyListPage /> },

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
            element: <SurveyDesignPage />,
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
              { path: 'overview', element: <SurveyOverviewPage /> },
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
                element: <SurveyDesignPage />,
              },
              { path: 'distribute', element: <SurveyDistributePage /> },
              { path: 'analyze', element: <SurveyAnalyticsPage /> },
            ],
          },
        ],
      },

      // ============================================
      // PUBLIC 경로
      // ============================================

      // 테스터 Experience - 온라인 스트리밍
      { path: '/play/:surveyUuid', element: <TesterPlaceholderPage /> },

      // 설문 세션 - interview / chat
      {
        path: '/surveys/session',
        children: [
          { path: ':surveyUuid', element: <SurveySessionStartPage /> },
          { path: 'sessions/:sessionUuid', element: <SurveySessionPage /> },
        ],
      },

      // 로그인
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
