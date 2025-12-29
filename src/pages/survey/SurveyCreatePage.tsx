import { Header } from '@/components/layout/Header';
import { SurveyRegisterForm } from '@/features/survey-designer';

/**
 * 설문 생성 페이지
 * URL: /survey/create
 */
function SurveyCreatePage() {
  const handleComplete = (data: unknown) => {
    console.log('설문 등록 완료:', data);
    // TODO: API 호출 및 리다이렉트
  };

  return (
    <div className="bg-background min-h-screen">
      <Header />
      <main className="container mx-auto max-w-2xl px-4 py-8">
        <h1 className="mb-8 text-2xl font-bold">설문 등록</h1>
        <SurveyRegisterForm onComplete={handleComplete} />
      </main>
    </div>
  );
}

export default SurveyCreatePage;
