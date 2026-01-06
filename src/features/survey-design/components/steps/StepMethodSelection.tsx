import { Check, ChevronDown, GitBranch, Lock, PenLine, Sparkles } from 'lucide-react';
import { useState } from 'react';
import { type Path, useFormContext, useWatch } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';

import { Button } from '@/components/ui';
import { Badge } from '@/components/ui/Badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { CheckboxGroup } from '@/components/ui/CheckboxGroup';
import { FormField, FormItem, FormLabel } from '@/components/ui/form';
import { getThemeDetailOptions, THEME_CATEGORY_OPTIONS } from '@/constants';
import { cn } from '@/lib/utils';

import { useSurveyFormStore } from '../../store/useSurveyFormStore';
import type { SurveyFormData, TestStage, ThemeCategory } from '../../types';

type GenerateMethod = 'ai' | 'manual' | 'flow' | null;

// 테스트 단계별 추천 순서
const STAGE_RECOMMENDED_ORDER: Record<TestStage, ThemeCategory[]> = {
    prototype: ['gameplay', 'ui_ux', 'balance', 'story', 'bug', 'overall'],
    playtest: ['ui_ux', 'balance', 'gameplay', 'story', 'bug', 'overall'],
    pre_launch: ['overall', 'bug', 'balance', 'ui_ux', 'gameplay', 'story'],
};

/**
 * Step 1: 질문 생성 방식 선택 + 테스트 목적 선택
 */
function StepMethodSelection() {
    const navigate = useNavigate();
    const { updateFormData } = useSurveyFormStore();
    const { control } = useFormContext<SurveyFormData>();

    const [selectedMethod, setSelectedMethod] = useState<GenerateMethod>(null);
    const [expandedCategory, setExpandedCategory] = useState<ThemeCategory | null>(null);

    // 폼 상태 감시
    const testStage = useWatch({ control, name: 'testStage' });
    const themePriorities = useWatch({ control, name: 'themePriorities' }) || [];
    const themeDetails = useWatch({ control, name: 'themeDetails' }) || {};

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

    // 질문 초기화 후 이동 (AI용)
    const handleAIGenerate = () => {
        if (themePriorities.length === 0) return;
        updateFormData({ questions: [], selectedQuestionIndices: [] });
        navigate('/survey/design/step-2?actor=ai');
    };

    // 수동 생성 다음 버튼
    const handleManualNext = () => {
        updateFormData({ questions: [], selectedQuestionIndices: [] });
        navigate('/survey/design/step-2?actor=user');
    };

    // AI 생성 버튼 활성화 조건
    const canAIGenerate = selectedMethod === 'ai' &&
        themePriorities.length >= 1 &&
        themePriorities.length <= 3;

    // 수동 생성 다음 버튼 활성화 조건
    const canManualNext = selectedMethod === 'manual';

    const methods = [
        {
            id: 'ai' as const,
            icon: Sparkles,
            label: 'AI 게임특화 자동 생성',
            description: '테스트 단계와 목적에 맞는 질문을 AI가 자동으로 생성합니다',
            disabled: false,
        },
        {
            id: 'manual' as const,
            icon: PenLine,
            label: '수동 생성',
            description: 'AI 피드백을 받으며 직접 질문을 작성합니다',
            disabled: false,
        },
        {
            id: 'flow' as const,
            icon: GitBranch,
            label: '게임 플로우 기반 심층 생성',
            description: '핵심 플로우 노드를 만들어 사용자 경험 질문을 생성합니다',
            disabled: true,
            badge: '준비 중',
        },
    ];

    return (
        <div className="flex flex-col gap-6">
            {/* Header */}
            <div className="text-center mb-4">
                <h2 className="text-xl font-semibold mb-2">질문 생성 방식을 선택하세요</h2>
                <p className="text-muted-foreground">
                    설문에 포함될 질문을 어떻게 만들지 선택해주세요
                </p>
            </div>

            {/* 생성 방식 버튼 */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {methods.map((method) => {
                    const Icon = method.icon;
                    const isSelected = selectedMethod === method.id;

                    const handleClick = () => {
                        if (method.disabled) return;
                        setSelectedMethod(method.id);
                    };

                    return (
                        <button
                            key={method.id}
                            type="button"
                            onClick={handleClick}
                            disabled={method.disabled}
                            className={cn(
                                'relative flex flex-col items-center p-6 rounded-xl border-2 transition-all duration-300',
                                'group',
                                method.disabled
                                    ? 'border-border bg-muted/30 cursor-not-allowed opacity-60'
                                    : isSelected
                                        ? 'border-primary bg-primary/10 shadow-lg'
                                        : 'border-border hover:border-primary/50 hover:bg-primary/5'
                            )}
                        >
                            {method.badge && (
                                <Badge
                                    variant="secondary"
                                    className="absolute top-3 right-3 flex items-center gap-1"
                                >
                                    <Lock className="w-3 h-3" />
                                    {method.badge}
                                </Badge>
                            )}
                            <div
                                className={cn(
                                    'w-14 h-14 rounded-xl flex items-center justify-center mb-4 transition-all',
                                    method.disabled
                                        ? 'bg-muted'
                                        : isSelected
                                            ? 'bg-primary/20'
                                            : 'bg-primary/10 group-hover:bg-primary/15'
                                )}
                            >
                                <Icon
                                    className={cn(
                                        'w-7 h-7 transition-colors',
                                        method.disabled
                                            ? 'text-muted-foreground'
                                            : isSelected
                                                ? 'text-primary'
                                                : 'text-primary/70'
                                    )}
                                />
                            </div>
                            <span
                                className={cn(
                                    'font-semibold text-base mb-2 text-center',
                                    method.disabled ? 'text-muted-foreground' : isSelected ? 'text-primary' : 'text-foreground'
                                )}
                            >
                                {method.label}
                            </span>
                            <p className="text-xs text-muted-foreground text-center leading-relaxed">
                                {method.description}
                            </p>
                        </button>
                    );
                })}
            </div>

            {/* 테스트 목적 선택 (AI 선택 시에만 표시) */}
            {selectedMethod === 'ai' && (
                <FormField
                    control={control}
                    name="themePriorities"
                    render={({ field, fieldState }) => (
                        <FormItem className="mt-6">
                            {/* 선택된 테마 요약 */}
                            {themePriorities.length > 0 && (
                                <Card className="bg-muted/30 mb-4">
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

                            <FormLabel>테스트 목적 (1~3개 선택)</FormLabel>
                            <div className="space-y-2 mt-2">
                                {getSortedThemeOptions().map((option) => {
                                    const category = option.value as ThemeCategory;
                                    const isSelected = field.value?.includes(category);
                                    const rank = getThemeRank(category);
                                    const isExpanded = expandedCategory === category;
                                    const detailOptions = getThemeDetailOptions(category);
                                    const selectedDetails = (themeDetails as Record<ThemeCategory, string[]>)?.[category] || [];

                                    return (
                                        <div key={category} className="border rounded-lg overflow-hidden">
                                            <button
                                                type="button"
                                                onClick={() => handleThemePriorityToggle(category, field.value || [], field.onChange)}
                                                className={cn(
                                                    'w-full flex items-center justify-between p-4 transition-colors',
                                                    isSelected ? 'bg-primary/10' : 'hover:bg-muted/50'
                                                )}
                                            >
                                                <div className="flex items-center gap-3">
                                                    {isSelected && (
                                                        <span className="flex items-center justify-center w-7 h-7 rounded-full bg-primary text-primary-foreground font-bold text-sm">
                                                            {rank}
                                                        </span>
                                                    )}
                                                    <span className={cn('font-medium', isSelected && 'text-primary')}>
                                                        {option.label}
                                                    </span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    {selectedDetails.length > 0 && (
                                                        <Badge variant="secondary">{selectedDetails.length}개 선택</Badge>
                                                    )}
                                                    {isSelected && (
                                                        <ChevronDown
                                                            className={cn(
                                                                'w-5 h-5 text-muted-foreground transition-transform',
                                                                isExpanded && 'rotate-180'
                                                            )}
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                setExpandedCategory(isExpanded ? null : category);
                                                            }}
                                                        />
                                                    )}
                                                    {!isSelected && <Check className="w-5 h-5 text-transparent" />}
                                                </div>
                                            </button>

                                            {isSelected && isExpanded && detailOptions.length > 0 && (
                                                <div className="p-4 bg-muted/30 border-t">
                                                    <p className="text-sm text-muted-foreground mb-3">세부 테마 선택 (선택사항)</p>
                                                    <FormField
                                                        control={control}
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
                            {fieldState.error && (
                                <p className="text-sm text-destructive mt-2">{fieldState.error.message}</p>
                            )}
                        </FormItem>
                    )}
                />
            )}

            {/* 생성 버튼 (AI 선택 시) */}
            {selectedMethod === 'ai' && (
                <div className="flex justify-end mt-4">
                    <Button
                        type="button"
                        onClick={handleAIGenerate}
                        disabled={!canAIGenerate}
                        size="lg"
                    >
                        AI 질문 생성
                    </Button>
                </div>
            )}

            {/* 다음 버튼 (수동 생성 선택 시) */}
            {selectedMethod === 'manual' && (
                <div className="flex justify-end mt-4">
                    <Button
                        type="button"
                        onClick={handleManualNext}
                        disabled={!canManualNext}
                        size="lg"
                    >
                        다음
                    </Button>
                </div>
            )}
        </div>
    );
}

export { StepMethodSelection };
