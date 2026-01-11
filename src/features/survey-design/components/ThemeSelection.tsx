import { Check, ChevronDown } from 'lucide-react';
import { useState } from 'react';
import { type Control, type Path, useFormContext, useWatch } from 'react-hook-form';

import { Badge } from '@/components/ui/Badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { CheckboxGroup } from '@/components/ui/CheckboxGroup';
import { FormField, FormItem, FormLabel } from '@/components/ui/form';
import { getThemeDetailOptions, THEME_CATEGORY_OPTIONS } from '@/constants';
import { cn } from '@/lib/utils';

import type { SurveyFormData, TestStage, ThemeCategory } from '../types';

// 테스트 단계별 추천 순서
const STAGE_RECOMMENDED_ORDER: Record<TestStage, ThemeCategory[]> = {
    prototype: ['gameplay', 'ui_ux', 'balance', 'story', 'bug', 'overall'],
    playtest: ['ui_ux', 'balance', 'gameplay', 'story', 'bug', 'overall'],
    pre_launch: ['overall', 'bug', 'balance', 'ui_ux', 'gameplay', 'story'],
};

type ThemeSelectionProps = {
    control: Control<SurveyFormData>;
    testStage?: TestStage;
};

/**
 * 테마 선택 컴포넌트
 * - 테마 대분류 1~3개 선택 (2×3 그리드)
 * - 선택된 테마별 세부 테마 토글
 */
function ThemeSelection({ control, testStage }: ThemeSelectionProps) {
    const { control: formControl } = useFormContext<SurveyFormData>();
    const actualControl = control || formControl;

    const [expandedCategory, setExpandedCategory] = useState<ThemeCategory | null>(null);

    // 폼 상태 감시
    const themePriorities = useWatch({ control: actualControl, name: 'themePriorities' }) || [];
    const themeDetails = useWatch({ control: actualControl, name: 'themeDetails' }) || {};

    // 테마 우선순위 토글
    const handleThemePriorityToggle = (
        category: ThemeCategory,
        currentValue: ThemeCategory[],
        onChange: (value: ThemeCategory[]) => void
    ) => {
        const isSelected = currentValue.includes(category);
        if (isSelected) {
            onChange(currentValue.filter((c) => c !== category));
            if (expandedCategory === category) setExpandedCategory(null);
        } else if (currentValue.length < 3) {
            onChange([...currentValue, category]);
            setExpandedCategory(category);
        }
    };

    // 선택된 테마의 순위 반환
    const getThemeRank = (category: ThemeCategory): number | null => {
        const index = themePriorities.indexOf(category);
        return index >= 0 ? index + 1 : null;
    };

    // 카테고리 라벨 가져오기
    const getCategoryLabel = (category: ThemeCategory) => {
        return THEME_CATEGORY_OPTIONS.find((o) => o.value === category)?.label || category;
    };

    // 현재 테스트 단계에 따른 추천 순서로 정렬된 옵션
    const getSortedThemeOptions = () => {
        if (!testStage) return THEME_CATEGORY_OPTIONS;
        const order = STAGE_RECOMMENDED_ORDER[testStage];
        if (!order) return THEME_CATEGORY_OPTIONS;
        return [...THEME_CATEGORY_OPTIONS].sort((a, b) => {
            const indexA = order.indexOf(a.value as ThemeCategory);
            const indexB = order.indexOf(b.value as ThemeCategory);
            return indexA - indexB;
        });
    };

    const sortedOptions = getSortedThemeOptions();

    return (
        <FormField
            control={actualControl}
            name="themePriorities"
            rules={{ required: '테스트 목적을 1개 이상 선택해주세요' }}
            render={({ field, fieldState }) => (
                <FormItem>
                    <FormLabel>테스트 목적 (1~3개 선택)</FormLabel>

                    {/* 선택된 테마 요약 */}
                    {themePriorities.length > 0 && (
                        <Card className="bg-muted/30 mb-4 mt-2">
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm">선택된 테스트 목적</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-2">
                                    {themePriorities.map((category, index) => {
                                        const selectedDetails = (themeDetails as Record<ThemeCategory, string[]>)?.[category] || [];
                                        return (
                                            <div key={category} className="flex items-start gap-2">
                                                <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary text-primary-foreground font-bold text-xs">
                                                    {index + 1}
                                                </span>
                                                <div>
                                                    <span className="font-medium">{getCategoryLabel(category)}</span>
                                                    {selectedDetails.length > 0 && (
                                                        <div className="flex flex-wrap gap-1 mt-1">
                                                            {selectedDetails.map((detail) => (
                                                                <Badge key={detail} variant="outline" className="text-xs">
                                                                    {getThemeDetailOptions(category).find((o) => o.value === detail)?.label || detail}
                                                                </Badge>
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {/* 2×3 그리드 테마 선택 */}
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-2">
                        {sortedOptions.map((option) => {
                            const category = option.value as ThemeCategory;
                            const isSelected = field.value?.includes(category);
                            const rank = getThemeRank(category);
                            const isDisabled = !isSelected && (field.value?.length || 0) >= 3;

                            return (
                                <button
                                    key={category}
                                    type="button"
                                    onClick={() => !isDisabled && handleThemePriorityToggle(category, field.value || [], field.onChange)}
                                    className={cn(
                                        'relative flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all min-h-[80px]',
                                        isSelected
                                            ? 'border-primary bg-primary/10'
                                            : isDisabled
                                                ? 'border-border bg-muted/30 cursor-not-allowed opacity-50'
                                                : 'border-border hover:border-primary/50 hover:bg-muted/50'
                                    )}
                                >
                                    {isSelected && rank && (
                                        <span className="absolute top-2 left-2 flex items-center justify-center w-6 h-6 rounded-full bg-primary text-primary-foreground font-bold text-xs">
                                            {rank}
                                        </span>
                                    )}
                                    <span className={cn('font-medium text-sm', isSelected && 'text-primary')}>
                                        {option.label}
                                    </span>
                                    {isSelected && (
                                        <Check className="absolute top-2 right-2 w-4 h-4 text-primary" />
                                    )}
                                </button>
                            );
                        })}
                    </div>

                    {/* 세부 테마 토글 (선택된 테마별) */}
                    {themePriorities.length > 0 && (
                        <div className="space-y-2 mt-4">
                            {themePriorities.map((category) => {
                                const isExpanded = expandedCategory === category;
                                const detailOptions = getThemeDetailOptions(category);
                                const selectedDetails = (themeDetails as Record<ThemeCategory, string[]>)?.[category] || [];

                                if (detailOptions.length === 0) return null;

                                return (
                                    <div key={category} className="border rounded-lg overflow-hidden">
                                        <button
                                            type="button"
                                            onClick={() => setExpandedCategory(isExpanded ? null : category)}
                                            className="w-full flex items-center justify-between p-3 bg-muted/30 hover:bg-muted/50 transition-colors"
                                        >
                                            <span className="font-medium text-sm">{getCategoryLabel(category)} 세부 테마</span>
                                            <div className="flex items-center gap-2">
                                                {selectedDetails.length > 0 && (
                                                    <Badge variant="secondary" className="text-xs">{selectedDetails.length}개 선택</Badge>
                                                )}
                                                <ChevronDown
                                                    className={cn(
                                                        'w-4 h-4 text-muted-foreground transition-transform',
                                                        isExpanded && 'rotate-180'
                                                    )}
                                                />
                                            </div>
                                        </button>

                                        {isExpanded && (
                                            <div className="p-3 border-t bg-background">
                                                <p className="text-xs text-muted-foreground mb-2">세부 테마 선택 (선택사항)</p>
                                                <FormField
                                                    control={actualControl}
                                                    name={`themeDetails.${category}` as Path<SurveyFormData>}
                                                    render={({ field: detailField }) => (
                                                        <CheckboxGroup
                                                            id={`themeDetails-${category}`}
                                                            label=""
                                                            options={detailOptions}
                                                            value={(detailField.value as string[]) || []}
                                                            onChange={detailField.onChange}
                                                        />
                                                    )}
                                                />
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    )}

                    {fieldState.error && (
                        <p className="text-sm text-destructive mt-2">{fieldState.error.message}</p>
                    )}
                </FormItem>
            )}
        />
    );
}

export { ThemeSelection };
export type { ThemeSelectionProps };
