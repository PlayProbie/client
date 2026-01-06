import { useQuery } from '@tanstack/react-query';
import { FileText, Plus } from 'lucide-react';
import { Link } from 'react-router-dom';

import { Button } from '@/components/ui';
import { Badge } from '@/components/ui/Badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { PageSpinner } from '@/components/ui/loading';
import { getSurveys } from '@/features/survey-design/api/get-surveys';
import { TestPurposeConfig } from '@/features/survey-design/types';

/**
 * 설문 목록 페이지
 * /surveys/list
 */
function SurveyListPage() {
    const { data, isLoading, isError } = useQuery({
        queryKey: ['surveys'],
        queryFn: getSurveys,
    });

    if (isLoading) {
        return <PageSpinner message="설문 목록을 불러오는 중..." />;
    }

    if (isError) {
        return (
            <div className="flex flex-col items-center justify-center h-64">
                <p className="text-destructive mb-4">설문 목록을 불러오지 못했습니다.</p>
                <Button onClick={() => window.location.reload()}>다시 시도</Button>
            </div>
        );
    }

    const surveys = data?.result || [];

    // 테스트 목적 라벨 변환
    const getPurposeLabel = (code: string) => {
        const config = Object.values(TestPurposeConfig).find((c) => c.value === code);
        return config?.label || code;
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold">내 설문</h1>
                <Button asChild>
                    <Link to="/survey/design/step-0">
                        <Plus className="h-4 w-4 mr-2" />
                        새 설문 만들기
                    </Link>
                </Button>
            </div>

            {surveys.length === 0 ? (
                <div className="text-center py-12 border border-dashed rounded-lg">
                    <p className="text-muted-foreground mb-4">아직 생성된 설문이 없습니다.</p>
                    <Button asChild variant="outline">
                        <Link to="/survey/design/step-0">첫 설문 만들기</Link>
                    </Button>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {surveys.map((survey) => (
                        <Card key={survey.survey_uuid} className="hover:border-primary transition-colors">
                            <CardHeader className="pb-2">
                                <div className="flex items-center gap-2">
                                    <FileText className="h-5 w-5 text-primary" />
                                    <CardTitle className="text-lg">{survey.survey_name}</CardTitle>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <Badge variant="secondary" className="mb-2">
                                    {getPurposeLabel(survey.test_purpose)}
                                </Badge>
                                <p className="text-sm text-muted-foreground">
                                    {survey.started_at?.split('T')[0]} ~ {survey.ended_at?.split('T')[0]}
                                </p>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}

export { SurveyListPage };
