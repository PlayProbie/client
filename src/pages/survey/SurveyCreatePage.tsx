import { useState } from 'react';

import { Header } from '@/components/layout/Header';
import { SurveyCreated, SurveyCreateForm } from '@/features/survey-design';

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
          <SurveyCreated surveyUrl={surveyUrl} />
        ) : (
          <>
            <h1 className="mb-8 text-2xl font-bold">설문 등록</h1>
            <SurveyCreateForm onComplete={handleComplete} />
          </>
        )}
      </main>
    </div>
  );
}

export default SurveyCreatePage;
