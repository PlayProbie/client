import { useEffect } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';

import { Button } from '@/components/ui/Button';
import { Form } from '@/components/ui/form';
import { Step } from '@/components/ui/Step';
import { cn } from '@/lib/utils';

import { useSurveySubmit } from '../hooks/useSurveySubmit';
import { useSurveyFormStore } from '../store/useSurveyFormStore';
import { SURVEY_FORM_STEPS, type SurveyFormData } from '../types';
import {
  StepConfirm,
  StepGameInfo,
  StepQuestionAIGenerate,
  StepQuestionUserGenerate,
  StepSurveyInfo,
} from './steps';

type SurveyRegisterFormProps = {
  className?: string;
  onComplete?: (surveyUrl: string) => void;
};

function SurveyRegisterForm({
  className,
  onComplete,
}: SurveyRegisterFormProps) {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { step } = useParams<{ step: string }>();

  const { currentStep, goToStep, formData, updateFormData, reset } =
    useSurveyFormStore();

  const form = useForm<SurveyFormData>({
    defaultValues: formData,
  });

  const { control, handleSubmit } = form;

  // useWatch로 폼 데이터 구독 (React Compiler 호환)
  const watchedData = useWatch({ control });

  // 설문 생성 API 호출 훅
  const { mutate: submitSurvey, isPending } = useSurveySubmit({
    onSuccess: (surveyUrl) => {
      // 임시 저장 초기화 후 완료 콜백 호출
      reset();
      onComplete?.(surveyUrl);
    },
    onError: (error) => {
      console.error('설문 생성 실패:', error);
      // TODO: 에러 토스트 표시
    },
  });

  // URL에서 step 파라미터가 변경되면 store 동기화
  useEffect(() => {
    if (step) {
      const stepMatch = step.match(/^step-(\d+)$/);
      if (stepMatch) {
        const stepNum = parseInt(stepMatch[1], 10);
        if (stepNum >= 0 && stepNum < SURVEY_FORM_STEPS.length) {
          goToStep(stepNum);
        }
      }
    }
  }, [step, goToStep]);

  // 폼 필드 변경 시 즉시 임시 저장
  useEffect(() => {
    updateFormData(watchedData as Partial<SurveyFormData>);
  }, [watchedData, updateFormData]);

  const createHandleNext = (actor?: 'user' | 'ai') =>
    handleSubmit((data) => {
      updateFormData(data);

      // 최종 확인 단계 (Step 3)에서 설문 생성 버튼 클릭 시 API 호출
      if (currentStep === SURVEY_FORM_STEPS.length - 1) {
        submitSurvey(formData);
        return;
      }

      // '직접 질문 생성' 선택 시 questions 초기화
      if (actor === 'user') {
        updateFormData({ questions: [], selectedQuestionIndices: [] });
        form.setValue('questions', []);
        form.setValue('selectedQuestionIndices', []);
      }

      // 다음 단계로 이동
      const nextStepNum = currentStep + 1;
      let path = `/survey/create/step-${nextStepNum}`;

      // actor 파라미터가 전달되었거나 기존 searchParams에 있으면 추가
      const actorValue = actor || searchParams.get('actor');
      if (actorValue) {
        path += `?actor=${actorValue}`;
      }
      navigate(path);
    });

  const handlePrev = () => {
    if (currentStep > 0) {
      navigate(`/survey/create/step-${currentStep - 1}`);
    }
  };

  const handleStepClick = (index: number) => {
    navigate(`/survey/create/step-${index}`);
  };

  const stepLabels = SURVEY_FORM_STEPS.map((s) => s.label);
  const isLastStep = currentStep === SURVEY_FORM_STEPS.length - 1;

  return (
    <div className={cn('flex flex-col gap-8', className)}>
      {/* Step Indicator */}
      <Step
        steps={stepLabels}
        currentStep={currentStep}
        onStepClick={handleStepClick}
      />

      {/* Form Content */}
      <Form {...form}>
        <form className="flex flex-col gap-6">
          <div className="min-h-[300px]">
            {currentStep === 0 && <StepGameInfo control={control} />}
            {currentStep === 1 && <StepSurveyInfo control={control} />}
            {currentStep === 2 &&
              (searchParams.get('actor') === 'user' ? (
                <StepQuestionUserGenerate />
              ) : (
                <StepQuestionAIGenerate />
              ))}
            {currentStep === 3 && <StepConfirm />}
          </div>

          {/* Navigation Buttons */}
          <div className="border-border flex justify-between border-t pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={handlePrev}
              disabled={currentStep === 0}
            >
              이전
            </Button>
            <div className="flex gap-2">
              {currentStep === 1 ? (
                <>
                  <Button
                    type="button"
                    disabled={isPending}
                    onClick={() => createHandleNext('user')()}
                  >
                    직접 질문 생성
                  </Button>
                  <Button
                    type="button"
                    disabled={isPending}
                    onClick={() => createHandleNext('ai')()}
                  >
                    AI 질문 생성
                  </Button>
                </>
              ) : (
                <Button
                  type="button"
                  disabled={isPending}
                  onClick={() => createHandleNext()()}
                >
                  {isPending ? '생성 중...' : isLastStep ? '설문 생성' : '다음'}
                </Button>
              )}
            </div>
          </div>
        </form>
      </Form>
    </div>
  );
}

export { SurveyRegisterForm };
export type { SurveyRegisterFormProps };
