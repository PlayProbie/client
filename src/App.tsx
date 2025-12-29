import './App.css';

import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';

import SurveyCreatePage from '@/pages/survey/SurveyCreatePage';

function App() {
  return (
    <BrowserRouter>
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
      </Routes>
    </BrowserRouter>
  );
}

export default App;
