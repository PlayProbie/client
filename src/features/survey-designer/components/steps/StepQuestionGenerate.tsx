import type { SurveyFormData } from '../../types';

type StepQuestionGenerateProps = {
  formData: Partial<SurveyFormData>;
};

/**
 * Step 2: 질문 생성
 * - AI 질문 생성 버튼
 * - 생성된 질문 목록
 */
function StepQuestionGenerate({ formData }: StepQuestionGenerateProps) {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col items-start gap-2">
        <h3 className="text-lg font-semibold">AI 질문 생성</h3>
        <p className="text-muted-foreground text-sm">
          게임 정보와 설문 목적을 바탕으로 AI가 적절한 질문을 생성합니다.
        </p>
      </div>
      <div className="border-border bg-muted/30 flex flex-col items-center justify-center rounded-lg border-2 border-dashed p-8">
        <p className="text-muted-foreground mb-4 text-sm">
          게임: {formData.gameName || '(미입력)'}
        </p>
        <p className="text-muted-foreground mb-4 text-sm">
          테스트 목적: {formData.testPurpose || '(미입력)'}
        </p>
        <p className="text-muted-foreground text-sm">
          다음 단계에서 질문 생성을 시작합니다.
        </p>
      </div>
    </div>
  );
}

export { StepQuestionGenerate };
