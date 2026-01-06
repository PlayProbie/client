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
import SurveyListPage from '@/pages/studio/SurveyListPage';
import SurveyAnalyticsPage from '@/pages/survey/SurveyAnalyticsPage';
import SurveyDesignPage from '@/pages/survey/SurveyDesignPage';
import SurveySessionPage from '@/pages/survey/SurveySessionPage';
import SurveySessionStartPage from '@/pages/survey/SurveySessionStartPage';
import WorkspaceDashboard from '@/pages/WorkspaceDashboard';

import { AuthLayout, GuestLayout, RootLayout } from './layouts';

// ============================================
// Survey Control Tower 페이지 (Lazy Load 준비)
// 현재는 기존 페이지 재사용, 추후 개별 페이지로 분리
// ============================================
// import SurveyOverviewPage from '@/pages/survey/SurveyOverviewPage';
// import SurveyDistributePage from '@/pages/survey/SurveyDistributePage';
// import SurveyAnalyzePage from '@/pages/survey/SurveyAnalyzePage';

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
          { path: '/', element: <WorkspaceDashboard /> },

          // 게임 목록 (새 경로)
          { path: '/games', element: <GamesListPage /> },

          // 게임 대시보드 Shell + 탭 (새 경로)
          {
            path: '/games/:gameUuid',
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

              // ============================================
              // [NEW] 게임 종속 설문 목록 (Survey List)
              // ============================================
              { path: 'surveys', element: <SurveyListPage /> },
              // { path: 'surveys/new', element: <SurveyCreatePage /> },
            ],
          },

          // ============================================
          // [NEW] Survey Control Tower (게임 종속 설문 상세)
          // 4개 탭: overview, design, distribute, analyze
          // TODO: SurveyShell 생성 필요
          // ============================================
          // {
          //   path: '/games/:gameUuid/surveys/:surveyId',
          //   element: <SurveyShell />,
          //   children: [
          //     { index: true, element: <Navigate to="overview" replace /> },
          //     { path: 'overview', element: <SurveyOverviewPage /> },
          //     { path: 'design', element: <SurveyDesignPage /> },
          //     { path: 'distribute', element: <SurveyDistributePage /> },
          //     { path: 'analyze', element: <SurveyAnalyzePage /> },
          //   ],
          // },

          // ============================================
          // [LEGACY] Creator Studio - 기존 경로 유지 (점진적 마이그레이션)
          // ============================================
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
            path: '/survey/analytics/:gameId',
            element: <SurveyAnalyticsPage />,
          },
        ],
      },

      // ============================================
      // [PUBLIC] 테스터 Experience - 온라인 스트리밍
      // ============================================
      // {
      //   path: '/play/:surveyId',
      //   children: [
      //     { index: true, element: <QueuePage /> },
      //     { path: 'stream', element: <GamePlayPage /> },
      //     { path: 'complete', element: <SessionCompletePage /> },
      //   ],
      // },

      // ============================================
      // [PUBLIC] 설문 세션 (기존 유지)
      // ============================================
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
