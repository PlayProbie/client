import { type Control, useWatch } from 'react-hook-form';

import { ButtonGroup } from '@/components/ui/ButtonGroup';
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/Input';
import { TEST_PURPOSE_OPTIONS } from '@/constants';

import type { SurveyFormData } from '../../types';

type StepSurveyInfoProps = {
  control: Control<SurveyFormData>;
};

/**
 * Step 1: 설문 정보
 * - 설문 이름
 * - 테스트 목적
 * - 시작일
 * - 종료일
 */
function StepSurveyInfo({ control }: StepSurveyInfoProps) {
  // 오늘 날짜 (min 값 설정용)
  const today = new Date().toISOString().split('T')[0];

  // 시작일 감시
  const startedAt = useWatch({
    control,
    name: 'startedAt',
  });

  return (
    <div className="flex flex-col gap-4">
      <FormField
        control={control}
        name="surveyName"
        rules={{ required: '설문 이름을 입력해주세요' }}
        render={({ field }) => (
          <FormItem>
            <FormLabel>설문 이름</FormLabel>
            <FormControl>
              <Input
                placeholder="예: 신규 게임 베타 테스트 설문"
                {...field}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={control}
        name="testPurpose"
        rules={{ required: '테스트 목적을 선택해주세요' }}
        render={({ field, fieldState }) => (
          <ButtonGroup
            id="testPurpose"
            label="테스트 목적"
            options={TEST_PURPOSE_OPTIONS}
            value={field.value}
            onChange={field.onChange}
            columns={3}
            error={fieldState.error?.message}
          />
        )}
      />

      <div className="grid grid-cols-2 gap-4">
        <FormField
          control={control}
          name="startedAt"
          rules={{ required: '시작일을 선택해주세요' }}
          render={({ field }) => (
            <FormItem>
              <FormLabel>시작일</FormLabel>
              <FormControl>
                <Input
                  type="date"
                  min={today}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name="endedAt"
          rules={{ required: '종료일을 선택해주세요' }}
          render={({ field }) => (
            <FormItem>
              <FormLabel>종료일</FormLabel>
              <FormControl>
                <Input
                  type="date"
                  min={startedAt || today}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </div>
  );
}

export { StepSurveyInfo };
