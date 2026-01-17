/**
 * SurveySessionCompletePage - 설문 세션 완료 및 감사 페이지
 * URL: /surveys/session/complete
 */

import { Button } from '@/components/ui';

function SurveySessionCompletePage() {
  return (
    <div className="bg-background flex min-h-screen flex-col items-center justify-center px-4 py-8">
      <div className="w-full max-w-md space-y-8 text-center">
        <div className="space-y-4">
          <h1 className="text-3xl font-bold tracking-tight">설문 참여 완료</h1>
          <p className="text-muted-foreground text-lg">
            참여해 주셔서 진심으로 감사드립니다.
            <br />
            귀하의 소중한 의견은 게임 경험 개선에 큰 도움이 됩니다.
          </p>
        </div>

        <div className="bg-card rounded-lg border p-10 px-6 shadow-sm">
          <h2 className="mb-4 text-xl font-semibold">PlayProbie</h2>
          <p className="text-muted-foreground mb-6">
            AI 기술을 활용한 게임 테스트 자동화 서비스를 만나보세요.
          </p>

          <Button
            className="bg-primary w-full text-white"
            size="lg"
          >
            서비스 소개 보러가기
          </Button>
        </div>
      </div>
    </div>
  );
}

export default SurveySessionCompletePage;
