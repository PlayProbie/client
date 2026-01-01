import { createBrowserRouter, Navigate } from 'react-router-dom';

import LoginPage from '@/pages/auth/LoginPage';
import NotFoundPage from '@/pages/NotFoundPage';
import SurveyChatPage from '@/pages/survey/SurveyChatPage';
import SurveyChatStartPage from '@/pages/survey/SurveyChatStartPage';
import SurveyCreatePage from '@/pages/survey/SurveyCreatePage';
import SurveyResponsePage from '@/pages/survey/SurveyResponsePage';
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
          // 설문 생성
          {
            path: '/survey/create',
            element: (
              <Navigate
                to="/survey/create/step-0"
                replace
              />
            ),
          },
          { path: '/survey/create/:step', element: <SurveyCreatePage /> },
          // 설문 응답 결과
          { path: '/survey/response', element: <SurveyResponsePage /> },
        ],
      },
      // 설문 채팅 (Public)
      {
        path: '/surveys/chat',
        children: [
          { path: ':surveyId', element: <SurveyChatStartPage /> },
          { path: 'sessions/:sessionId', element: <SurveyChatPage /> },
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
