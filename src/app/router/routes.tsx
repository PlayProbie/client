import { createBrowserRouter, Navigate } from 'react-router-dom';

import { GameShell } from '@/features/game-streaming';
import LoginPage from '@/pages/auth/LoginPage';
import RegisterPage from '@/pages/auth/RegisterPage';
import NotFoundPage from '@/pages/NotFoundPage';
// [STASH] Screen G: Tester Placeholder
// import TesterPlaceholderPage from '@/pages/play/TesterPlaceholderPage';
import BuildsPage from '@/pages/studio/BuildsPage';
import GameOverviewPage from '@/pages/studio/GameOverviewPage';
import GamesListPage from '@/pages/studio/GamesListPage';
import StreamSettingsPage from '@/pages/studio/StreamSettingsPage';
import SurveyAnalyticsPage from '@/pages/survey/SurveyAnalyticsPage';
import SurveyDesignPage from '@/pages/survey/SurveyDesignPage';
import SurveySessionPage from '@/pages/survey/SurveySessionPage';
import SurveySessionStartPage from '@/pages/survey/SurveySessionStartPage';
import WorkspaceDashboard from '@/pages/WorkspaceDashboard';

import { AuthLayout, GuestLayout, RootLayout } from './layouts';

export const router = createBrowserRouter([
  {
    element: <RootLayout />,
    children: [
      // 인증이 필요한 라우트
      {
        element: <AuthLayout />,
        children: [
          { path: '/', element: <WorkspaceDashboard /> },
          // Creator Studio - 게임 스트리밍
          { path: '/studio/games', element: <GamesListPage /> },
          {
            path: '/studio/games/:gameUuid',
            element: <GameShell />,
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
              { path: 'overview', element: <GameOverviewPage /> },
              { path: 'builds', element: <BuildsPage /> },
              { path: 'stream-settings', element: <StreamSettingsPage /> },
            ],
          },
          // 설문 관리 (Redirect)
          {
            path: '/survey',
            element: (
              <Navigate
                to="/survey/design/step-0"
                replace
              />
            ),
          },
          // 설문 설계
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
          // 설문 분석 결과
          {
            path: '/survey/analytics/:gameId',
            element: <SurveyAnalyticsPage />,
          },
        ],
      },
      // 설문 세션 (Public)
      {
        path: '/surveys/session',
        children: [
          { path: ':surveyId', element: <SurveySessionStartPage /> },
          { path: 'sessions/:sessionId', element: <SurveySessionPage /> },
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
