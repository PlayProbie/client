import { useEffect } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import {
  useLocation,
  useNavigate,
  useParams,
  useSearchParams,
} from 'react-router-dom';

import { Button } from '@/components/ui';
import { Form } from '@/components/ui/form';
import { Step } from '@/components/ui/Step';
import { useToast } from '@/hooks/useToast';
import { cn } from '@/lib/utils';

import { useFormSubmit } from '../hooks/useFormSubmit';
import { useSurveyFormStore } from '../store/useSurveyFormStore';
import { SURVEY_FORM_STEPS, type SurveyFormData } from '../types';
import {
  StepBasicInfo,
  StepConfirm,
  StepMethodSelection,
  StepQuestionAIGenerate,
  StepQuestionUserGenerate,
} from './steps';

type SurveyDesignFormProps = {
  className?: string;
  onComplete?: (surveyUrl: string) => void;
};

function SurveyDesignForm({ className, onComplete }: SurveyDesignFormProps) {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { step } = useParams<{ step?: string }>();
  const { toast } = useToast();

  const { currentStep, goToStep, formData, updateFormData, reset } =
    useSurveyFormStore();

  const form = useForm<SurveyFormData>({
    defaultValues: formData,
  });

  const { control, handleSubmit } = form;

  // useWatch로 폼 데이터 구독 (React Compiler 호환)
  const watchedData = useWatch({ control });

  // 설문 생성 API 호출 훅
  const { mutate: submitSurvey, isPending } = useFormSubmit({
    onSuccess: (surveyUrl) => {
      // 임시 저장 초기화 후 완료 콜백 호출
      // reset(); // onSuccess에서 reset하면 바로 step-0으로 튕김
      onComplete?.(surveyUrl);
    },
    onError: () => {
      toast({
        variant: 'destructive',
        title: '설문 생성 실패',
        description: '설문 생성에 실패했습니다. 다시 시도해주세요.',
      });
    },
  });

  // URL에서 step 파라미터가 변경되면 store 동기화
  const pathWithoutStep = location.pathname.replace(/\/step-\d+$/, '');

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

  // 컴포넌트 언마운트 시 (설문 생성 완료 등) 스토어 리셋
  useEffect(() => {
    return () => {
      reset();
    };
  }, [reset]);

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

      // actor 파라미터가 전달되었거나 기존 searchParams에 있으면 추가
      const actorValue = actor || searchParams.get('actor');
      let nextPath = `${pathWithoutStep}/step-${nextStepNum}`;
      if (actorValue) {
        nextPath += `?actor=${actorValue}`;
      }
      navigate(nextPath);
    });

  const handlePrev = () => {
    if (currentStep > 0) {
      navigate(`${pathWithoutStep}/step-${currentStep - 1}`);
    }
  };

  const handleStepClick = (index: number) => {
    navigate(`${pathWithoutStep}/step-${index}`);
  };

  const stepLabels = SURVEY_FORM_STEPS.map((s) => s.label);
  const isLastStep = currentStep === SURVEY_FORM_STEPS.length - 1;

  /** 현재 Step에 해당하는 컴포넌트 렌더링 */
  const renderStepContent = () => {
    const isUserGenerate = searchParams.get('actor') === 'user';

    switch (currentStep) {
      case 0:
        return <StepBasicInfo control={control} />;
      case 1:
        return <StepMethodSelection />;
      case 2:
        return isUserGenerate ? (
          <StepQuestionUserGenerate />
        ) : (
          <StepQuestionAIGenerate />
        );
      case 3:
        return <StepConfirm />;
      default:
        return null;
    }
  };

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
        <form
          className="flex flex-col gap-6"
          onSubmit={(e) => e.preventDefault()}
        >
          <div className="min-h-[300px]">{renderStepContent()}</div>

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
                null /* StepMethodSelection에서 자체 네비게이션 */
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

export { SurveyDesignForm };
export type { SurveyDesignFormProps };
