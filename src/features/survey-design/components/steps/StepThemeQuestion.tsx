import { type Control, type Path, useWatch } from 'react-hook-form';

import { CheckboxGroup } from '@/components/ui/CheckboxGroup';
import { FormField } from '@/components/ui/form';
import { getThemeDetailOptions, THEME_CATEGORY_OPTIONS } from '@/constants';

import type { SurveyFormData, ThemeCategory } from '../../types';

type StepThemeQuestionProps = {
    control: Control<SurveyFormData>;
};

/**
 * Step 1: 테마 & 질문 생성
 * - 테스트 목적 우선순위 (1~3개 선택)
 * - 세부 테마 (선택한 테마별로 표시)
 */
function StepThemeQuestion({ control }: StepThemeQuestionProps) {
    const themePriorities = useWatch({ control, name: 'themePriorities' }) || [];

    return (
        <div className="flex flex-col gap-6">
            {/* 테스트 목적 우선순위 (1~3개 선택) */}
            <FormField
                control={control}
                name="themePriorities"
                rules={{
                    validate: (value) =>
                        (value && value.length >= 1 && value.length <= 3) ||
                        '테스트 목적을 1~3개 선택해주세요',
                }}
                render={({ field, fieldState }) => (
                    <CheckboxGroup
                        id="themePriorities"
                        label="테스트 목적 우선순위 (1~3개 선택)"
                        options={THEME_CATEGORY_OPTIONS}
                        value={field.value || []}
                        onChange={field.onChange}
                        error={fieldState.error?.message}
                    />
                )}
            />

            {/* 세부 테마 선택 */}
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
        </div>
    );
}

export { StepThemeQuestion };
