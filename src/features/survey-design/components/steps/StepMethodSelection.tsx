import { GitBranch, Lock, PenLine, Sparkles } from 'lucide-react';

import { Badge } from '@/components/ui/Badge';
import { cn } from '@/lib/utils';

export type GenerateMethod = 'ai' | 'manual' | 'flow' | null;

type StepMethodSelectionProps = {
    selectedMethod: GenerateMethod;
    onSelectMethod: (method: GenerateMethod) => void;
};

/**
 * Step 1: 질문 생성 방식 선택
 */
function StepMethodSelection({ selectedMethod, onSelectMethod }: StepMethodSelectionProps) {

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
                        onSelectMethod(method.id);
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
        </div>
    );
}

export { StepMethodSelection };
