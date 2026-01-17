import { type Control, type Path, useWatch } from 'react-hook-form';

import { ButtonGroup } from '@/components/ui/ButtonGroup';
import { CheckboxGroup } from '@/components/ui/CheckboxGroup';
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import {
  getThemeDetailOptions,
  TEST_PURPOSE_OPTIONS,
  TEST_STAGE_OPTIONS,
  THEME_CATEGORY_OPTIONS,
} from '@/constants';

import type { SurveyFormData, ThemeCategory } from '../../types';

type StepSurveyInfoProps = {
  control: Control<SurveyFormData>;
};

/**
 * Step 1: 설문 정보
 * - 설문 이름
 * - 테스트 목적
 * - 테스트 단계 (신규)
 * - 테마 우선순위 (신규)
 * - 세부테마 (신규)
 * - 시작일/종료일
 * - 버전노트 (신규)
 */
function StepSurveyInfo({ control }: StepSurveyInfoProps) {
  // 오늘 날짜 (min 값 설정용)
  const today = new Date().toISOString().split('T')[0];

  // 시작일 감시
  const startedAt = useWatch({ control, name: 'startedAt' });

  // 선택된 테마 우선순위 감시 (세부테마 표시용)
  const themePriorities = useWatch({ control, name: 'themePriorities' }) || [];

  return (
    <div className="flex flex-col gap-6">
      {/* 설문 이름 */}
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

      {/* 테스트 목적 (기존) */}
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

      {/* 테스트 단계 (신규) */}
      <FormField
        control={control}
        name="testStage"
        rules={{ required: '테스트 단계를 선택해주세요' }}
        render={({ field, fieldState }) => (
          <ButtonGroup
            id="testStage"
            label="테스트 단계"
            options={TEST_STAGE_OPTIONS}
            value={field.value}
            onChange={field.onChange}
            columns={3}
            error={fieldState.error?.message}
          />
        )}
      />

      {/* 테마 우선순위 (신규) - 1~3개 선택 */}
      <FormField
        control={control}
        name="themePriorities"
        rules={{
          validate: (value) =>
            (value && value.length >= 1 && value.length <= 3) ||
            '테마를 1~3개 선택해주세요',
        }}
        render={({ field, fieldState }) => (
          <CheckboxGroup
            id="themePriorities"
            label="테마 우선순위 (1~3개 선택)"
            options={THEME_CATEGORY_OPTIONS}
            value={field.value || []}
            onChange={field.onChange}
            error={fieldState.error?.message}
          />
        )}
      />

      {/* 세부테마 (신규) - 선택한 테마별로 표시 */}
      {themePriorities.length > 0 && (
        <div className="space-y-4 p-4 border rounded-lg bg-muted/30">
          <p className="text-sm font-medium text-muted-foreground">
            세부 테마 선택 (선택사항)
          </p>
          {themePriorities.map((category: ThemeCategory) => {
            const detailOptions = getThemeDetailOptions(category);
            const categoryLabel =
              THEME_CATEGORY_OPTIONS.find((o) => o.value === category)?.label ||
              category;

            return (
              <FormField
                key={category}
                control={control}
                name={`themeDetails.${category}` as Path<SurveyFormData>}
                render={({ field }) => (
                  <CheckboxGroup
                    id={`themeDetails-${category}`}
                    label={categoryLabel}
                    options={detailOptions}
                    value={(field.value as string[]) || []}
                    onChange={field.onChange}
                  />
                )}
              />
            );
          })}
        </div>
      )}

      {/* 시작일/종료일 */}
      <div className="grid grid-cols-2 gap-4">
        <FormField
          control={control}
          name="startedAt"
          rules={{ required: '시작일을 선택해주세요' }}
          render={({ field }) => (
            <FormItem>
              <FormLabel>시작일</FormLabel>
              <FormControl>
                <Input type="date" min={today} {...field} />
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
                <Input type="date" min={startedAt || today} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      {/* 버전노트 (신규) */}
      <FormField
        control={control}
        name="versionNote"
        render={({ field }) => (
          <FormItem>
            <FormLabel>버전 메모 (선택)</FormLabel>
            <FormControl>
              <Textarea
                placeholder="예: v0.3 전투 시스템 개편, UI 리뉴얼"
                className="min-h-[80px]"
                {...field}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
}

export { StepSurveyInfo };

