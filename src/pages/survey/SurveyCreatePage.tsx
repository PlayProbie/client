import { useState } from 'react';

import { Header } from '@/components/layout/Header';
import {
  SurveyRegisterComplete,
  SurveyRegisterForm,
} from '@/features/survey-designer';

/**
 * 설문 생성 페이지
 * URL: /survey/create
 */
function SurveyCreatePage() {
  const [isCompleted, setIsCompleted] = useState(false);
  const [surveyUrl, setSurveyUrl] = useState<string | null>(null);

  const handleComplete = (url: string) => {
    setSurveyUrl(url);
    setIsCompleted(true);
  };

  return (
    <div className="bg-background min-h-screen">
      <Header />
      <main className="container mx-auto max-w-2xl px-4 py-8">
        {isCompleted && surveyUrl ? (
          <SurveyRegisterComplete surveyUrl={surveyUrl} />
        ) : (
          <>
            <h1 className="mb-8 text-2xl font-bold">설문 등록</h1>
            <SurveyRegisterForm onComplete={handleComplete} />
          </>
        )}
      </main>
    </div>
  );
}

export default SurveyCreatePage;
