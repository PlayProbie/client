import { GitBranch, Lock, PenLine, Sparkles } from 'lucide-react';
import { useState } from 'react';
import { useFormContext, useWatch } from 'react-hook-form';
import { useLocation, useNavigate } from 'react-router-dom';

import { Button } from '@/components/ui';
import { Badge } from '@/components/ui/Badge';
import { cn } from '@/lib/utils';

import { useSurveyFormStore } from '../../store/useSurveyFormStore';
import type { SurveyFormData } from '../../types';

type GenerateMethod = 'ai' | 'manual' | 'flow' | null;

/**
 * Step 1: 질문 생성 방식 선택
 */
function StepMethodSelection() {
    const navigate = useNavigate();
    const location = useLocation();
    const { updateFormData } = useSurveyFormStore();
    const { control } = useFormContext<SurveyFormData>();

    const [selectedMethod, setSelectedMethod] = useState<GenerateMethod>(null);

    // 현재 경로에서 step 부분을 제거한 base path 계산
    const pathWithoutStep = location.pathname.replace(/\/step-\d+$/, '');

    // 폼 상태 감시 (테마는 Step 0에서 이미 선택됨)
    const themePriorities = useWatch({ control, name: 'themePriorities' }) || [];

    // 질문 초기화 후 이동 (AI용)
    const handleAIGenerate = () => {
        if (themePriorities.length === 0) return;
        updateFormData({ questions: [], selectedQuestionIndices: [] });
        navigate(`${pathWithoutStep}/step-2?actor=ai`);
    };

    // 수동 생성 다음 버튼
    const handleManualNext = () => {
        updateFormData({ questions: [], selectedQuestionIndices: [] });
        navigate(`${pathWithoutStep}/step-2?actor=user`);
    };

    // AI 생성 버튼 활성화 조건 (테마는 Step 0에서 이미 선택됨)
    const canAIGenerate = selectedMethod === 'ai' &&
        themePriorities.length >= 1 &&
        themePriorities.length <= 3;

    // 수동 생성 다음 버튼 활성화 조건
    const canManualNext = selectedMethod === 'manual' &&
        themePriorities.length >= 1;

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
