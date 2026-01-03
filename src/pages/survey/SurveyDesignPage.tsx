import { useState } from 'react';

import { SurveyCreated, SurveyDesignForm } from '@/features/survey-design';

/**
 * 설문 설계 페이지
 * URL: /survey/design
 */
function SurveyDesignPage() {
  const [isCompleted, setIsCompleted] = useState(false);
  const [surveyUrl, setSurveyUrl] = useState<string | null>(null);

  const handleComplete = (url: string) => {
    setSurveyUrl(url);
    setIsCompleted(true);
  };

  return (
    <div className="bg-background min-h-screen">
      <main className="container mx-auto max-w-2xl px-4 py-8">
        {isCompleted && surveyUrl ? (
          <SurveyCreated surveyUrl={surveyUrl} />
        ) : (
          <>
            <h1 className="mb-8 text-2xl font-bold">설문 등록</h1>
            <SurveyDesignForm onComplete={handleComplete} />
          </>
        )}
      </main>
    </div>
  );
}

export default SurveyDesignPage;
