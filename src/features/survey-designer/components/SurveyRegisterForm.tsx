import { useEffect } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { useNavigate, useParams } from 'react-router-dom';

import { Button } from '@/components/ui/Button';
import { Form } from '@/components/ui/form';
import { Step } from '@/components/ui/Step';
import { cn } from '@/lib/utils';

import { useSurveyFormStore } from '../store/useSurveyFormStore';
import { SURVEY_FORM_STEPS, type SurveyFormData } from '../types';
import {
  StepComplete,
  StepConfirm,
  StepGameInfo,
  StepQuestionGenerate,
  StepSurveyInfo,
} from './steps';

type SurveyRegisterFormProps = {
  className?: string;
  onComplete?: (data: SurveyFormData) => void;
};

function SurveyRegisterForm({
  className,
  onComplete,
}: SurveyRegisterFormProps) {
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

  const handleNext = handleSubmit((data) => {
    updateFormData(data);
    if (currentStep === SURVEY_FORM_STEPS.length - 1) {
      // 최종 제출 시 임시 저장 초기화
      reset();
      onComplete?.(data as SurveyFormData);
    } else {
      const nextStepNum = currentStep + 1;
      navigate(`/survey/create/step-${nextStepNum}`);
    }
  });

  const handlePrev = () => {
    if (currentStep > 0) {
      navigate(`/survey/create/step-${currentStep - 1}`);
    }
  };

  const stepLabels = SURVEY_FORM_STEPS.map((s) => s.label);
  const isLastStep = currentStep === SURVEY_FORM_STEPS.length - 1;
  const isConfirmStep = currentStep === 3;

  return (
    <div className={cn('flex flex-col gap-8', className)}>
      {/* Step Indicator */}
      <Step
        steps={stepLabels}
        currentStep={currentStep}
      />

      {/* Form Content */}
      <Form {...form}>
        <form
          onSubmit={handleNext}
          className="flex flex-col gap-6"
        >
          <div className="min-h-[300px]">
            {currentStep === 0 && <StepGameInfo control={control} />}
            {currentStep === 1 && <StepSurveyInfo control={control} />}
            {currentStep === 2 && <StepQuestionGenerate formData={formData} />}
            {currentStep === 3 && <StepConfirm control={control} />}
            {currentStep === 4 && <StepComplete />}
          </div>

          {/* Navigation Buttons */}
          <div className="border-border flex justify-between border-t pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={handlePrev}
              disabled={currentStep === 0 || isLastStep}
            >
              이전
            </Button>
            {!isLastStep && (
              <Button type="submit">
                {isConfirmStep ? '설문 생성' : '다음'}
              </Button>
            )}
          </div>
        </form>
      </Form>
    </div>
  );
}

export { SurveyRegisterForm };
export type { SurveyRegisterFormProps };
