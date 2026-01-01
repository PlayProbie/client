import './App.css';

import { Navigate, Route, Routes } from 'react-router-dom';

import SurveyChatPage from '@/pages/survey/SurveyChatPage';
import SurveyChatStartPage from '@/pages/survey/SurveyChatStartPage';
import SurveyCreatePage from '@/pages/survey/SurveyCreatePage';

import SurveyResponsePage from './pages/survey/SurveyResponsePage';

function App() {
  return (
    <Routes>
      {/* '/' 경로는 '/survey/create/step-0'으로 리다이렉트 */}
      <Route
        path="/"
        element={
          <Navigate
            to="/survey/create/step-0"
            replace
          />
        }
      />
      {/* 설문 생성 기본 경로도 step-0으로 리다이렉트 */}
      <Route
        path="/survey/create"
        element={
          <Navigate
            to="/survey/create/step-0"
            replace
          />
        }
      />
      {/* 각 step별 경로 */}
      <Route
        path="/survey/create/:step"
        element={<SurveyCreatePage />}
      />
      {/* 설문 응답 결과 페이지 */}
      <Route
        path="/survey/response"
        element={<SurveyResponsePage />}
      />
      {/* 설문 채팅 진행 페이지 */}
      <Route
        path="/surveys/chat/sessions/:sessionId"
        element={<SurveyChatPage />}
      />
      {/* 설문 채팅 시작 - 세션 생성 후 리다이렉트 */}
      <Route
        path="/surveys/chat/:surveyId"
        element={<SurveyChatStartPage />}
      />
    </Routes>
  );
}

export default App;
