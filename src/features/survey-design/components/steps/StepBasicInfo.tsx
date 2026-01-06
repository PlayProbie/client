import { useQuery } from '@tanstack/react-query';
import { Lightbulb, Rocket, Users } from 'lucide-react';
import { useEffect } from 'react';
import { type Control } from 'react-hook-form';
import { useSearchParams } from 'react-router-dom';

import { Badge } from '@/components/ui/Badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import {
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/Input';
import { Spinner } from '@/components/ui/loading';
import { Textarea } from '@/components/ui/Textarea';
import { getGame } from '@/features/game/api/get-game';
import { type GameGenre, GameGenreConfig } from '@/features/game/types';
import { cn } from '@/lib/utils';

import { useSurveyFormStore } from '../../store/useSurveyFormStore';
import type { SurveyFormData, TestStage, ThemeCategory } from '../../types';

type StepBasicInfoProps = {
    control: Control<SurveyFormData>;
};

// 테스트 단계 설정
const TEST_STAGE_CONFIG = {
    prototype: {
        value: 'prototype' as TestStage,
        label: '프로토타입',
        description: '핵심 재미가 작동하는지 확인하고 싶어요',
        icon: Lightbulb,
        // 프로토타입 단계 추천 순서
        recommendedOrder: ['gameplay', 'ui_ux', 'balance', 'story', 'bug', 'overall'] as ThemeCategory[],
    },
    playtest: {
        value: 'playtest' as TestStage,
        label: '첫 외부 플레이테스트',
        description: '처음으로 외부 테스터에게 보여주는 단계예요',
        icon: Users,
        // 플레이테스트 단계 추천 순서
        recommendedOrder: ['ui_ux', 'balance', 'gameplay', 'story', 'bug', 'overall'] as ThemeCategory[],
    },
    pre_launch: {
        value: 'pre_launch' as TestStage,
        label: '출시 전 최종 점검',
        description: '거의 완성됐고, 마지막 피드백이 필요해요',
        icon: Rocket,
        // 출시 전 단계 추천 순서
        recommendedOrder: ['overall', 'bug', 'balance', 'ui_ux', 'gameplay', 'story'] as ThemeCategory[],
    },
} as const;

function StepBasicInfo({ control }: StepBasicInfoProps) {
    const [searchParams] = useSearchParams();
    const gameUuid = searchParams.get('gameId');

    // 게임 정보 로드
    const { data: gameData, isLoading: isLoadingGame } = useQuery({
        queryKey: ['game', gameUuid],
        queryFn: () => getGame(gameUuid!),
        enabled: !!gameUuid,
    });

    const game = gameData;

    // store 접근
    const { updateFormData } = useSurveyFormStore();

    // 게임 정보가 로드되면 store에 저장
    useEffect(() => {
        if (game) {
            updateFormData({
                gameName: game.gameName,
                gameGenre: game.gameGenre as GameGenre[],
                gameContext: game.gameContext,
            });
        }
    }, [game, updateFormData]);

    const getGenreLabels = (genres: string[]) => {
        return genres.map((code) => {
            const config = Object.values(GameGenreConfig).find((c) => c.value === code);
            return config?.label || code;
        });
    };

    return (
        <div className="flex flex-col gap-6">
            {/* 1. 설문 이름 */}
            <FormField
                control={control}
                name="surveyName"
                rules={{ required: '설문 이름을 입력해주세요' }}
                render={({ field }) => (
                    <FormItem>
                        <FormLabel>설문 이름</FormLabel>
                        <FormControl>
                            <Input placeholder="예: v1.2 플레이테스트 설문" {...field} />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                )}
            />

            {/* 2. 게임 정보 */}
            <Card>
                <CardHeader className="pb-2">
                    <CardTitle className="text-base">게임 정보</CardTitle>
                </CardHeader>
                <CardContent>
                    {isLoadingGame ? (
                        <div className="flex items-center gap-2">
                            <Spinner size="sm" />
                            <span className="text-muted-foreground">게임 정보 로딩 중...</span>
                        </div>
                    ) : game ? (
                        <div className="space-y-2">
                            <div>
                                <span className="text-sm text-muted-foreground">게임 이름: </span>
                                <span className="font-medium">{game.gameName}</span>
                            </div>
                            <div className="flex flex-wrap gap-1">
                                {getGenreLabels(game.gameGenre).map((label) => (
                                    <Badge key={label} variant="secondary">{label}</Badge>
                                ))}
                            </div>
                            {game.gameContext && (
                                <p className="text-sm text-muted-foreground">{game.gameContext}</p>
                            )}
                        </div>
                    ) : (
                        <p className="text-destructive">
                            게임을 선택해주세요. 게임 목록에서 설문 생성을 시작하세요.
                        </p>
                    )}
                </CardContent>
            </Card>

            {/* 3. 버전 메모 */}
            <FormField
                control={control}
                name="versionNote"
                render={({ field }) => (
                    <FormItem>
                        <FormLabel>버전 메모 (선택)</FormLabel>
                        <FormControl>
                            <Textarea
                                placeholder="이번 테스트의 버전 메모를 입력하세요"
                                className="min-h-[80px]"
                                {...field}
                            />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                )}
            />

            {/* 4. 테스트 단계 */}
            <FormField
                control={control}
                name="testStage"
                rules={{ required: '테스트 단계를 선택해주세요' }}
                render={({ field, fieldState }) => (
                    <FormItem>
                        <FormLabel>테스트 단계</FormLabel>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-2">
                            {Object.values(TEST_STAGE_CONFIG).map((stage) => {
                                const Icon = stage.icon;
                                const isSelected = field.value === stage.value;
                                return (
                                    <button
                                        key={stage.value}
                                        type="button"
                                        onClick={() => field.onChange(stage.value)}
                                        className={cn(
                                            'flex flex-col items-center p-6 rounded-xl border-2 transition-all text-center',
                                            'hover:border-primary/50 hover:bg-muted/50',
                                            isSelected
                                                ? 'border-primary bg-primary/5 ring-2 ring-primary/20'
                                                : 'border-border'
                                        )}
                                    >
                                        <Icon className={cn('w-10 h-10 mb-3', isSelected ? 'text-primary' : 'text-muted-foreground')} />
                                        <span className={cn('font-semibold text-lg mb-2', isSelected ? 'text-primary' : 'text-foreground')}>
                                            {stage.label}
                                        </span>
                                        {isSelected && (
                                            <span className="text-sm text-muted-foreground">{stage.description}</span>
                                        )}
                                    </button>
                                );
                            })}
                        </div>
                        {fieldState.error && (
                            <p className="text-sm text-destructive mt-2">{fieldState.error.message}</p>
                        )}
                    </FormItem>
                )}
            />
        </div>
    );
}

export { StepBasicInfo };
