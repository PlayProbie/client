import { createBrowserRouter, Navigate } from 'react-router-dom';

import LoginPage from '@/pages/auth/LoginPage';
import NotFoundPage from '@/pages/NotFoundPage';
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
      // 비인증 사용자 전용 라우트
      {
        element: <GuestLayout />,
        children: [{ path: '/login', element: <LoginPage /> }],
      },
      // 404 페이지
      { path: '*', element: <NotFoundPage /> },
    ],
  },
]);
