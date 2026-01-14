/**
 * VersionDetailPage
 *
 * 버전 선택 시 표시되는 페이지
 * - 빌드 파일 업로드 영역
 * - 해당 버전의 설문 리스트
 */

import { Plus } from 'lucide-react';
import { useParams } from 'react-router-dom';

import { Button, Card, CardContent, CardHeader, CardTitle } from '@/components/ui';
import { PageSpinner } from '@/components/ui';

// TODO: 실제 API 연결 시 사용
// import { useVersionSurveysQuery } from '@/features/version';

interface Survey {
  surveyUuid: string;
  surveyName: string;
  status: 'DRAFT' | 'ACTIVE' | 'CLOSED';
  responseCount: number;
  createdAt: string;
}

// Mock 설문 데이터
const MOCK_SURVEYS: Survey[] = [
  {
    surveyUuid: 'srv-001',
    surveyName: '베타 테스트 피드백',
    status: 'DRAFT',
    responseCount: 0,
    createdAt: '2026-01-12',
  },
  {
    surveyUuid: 'srv-002',
    surveyName: '초기 진입 사용자 서베이',
    status: 'ACTIVE',
    responseCount: 142,
    createdAt: '2025-12-20',
  },
];

export default function VersionDetailPage() {
  const { gameUuid, versionUuid } = useParams<{
    gameUuid: string;
    versionUuid: string;
  }>();

  // TODO: 실제 API 연결
  const isLoading = false;
  const surveys = MOCK_SURVEYS;

  if (isLoading) {
    return <PageSpinner message="버전 정보를 불러오는 중..." />;
  }

  return (
    <div className="space-y-6">
      {/* Builds 섹션 */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Builds</CardTitle>
          <Button size="sm">
            <Plus className="mr-2 size-4" />
            Upload Build
          </Button>
        </CardHeader>
        <CardContent>
          <div className="border-muted flex min-h-[200px] flex-col items-center justify-center rounded-lg border-2 border-dashed p-8">
            <p className="text-muted-foreground mb-4 text-sm">
              첫 빌드를 업로드하세요
            </p>
            <Button variant="outline">
              <Plus className="mr-2 size-4" />
              Upload Build
            </Button>
          </div>
          <p className="text-muted-foreground mt-2 text-xs">
            Tip: ExecutablePath는 업로드 폴더 내 실행 파일의 상대 경로입니다.
            예) /Game/Binaries/Win64/MyGame.exe
          </p>
        </CardContent>
      </Card>

      {/* Surveys 섹션 */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Surveys</CardTitle>
          <Button
            size="sm"
            onClick={() => {
              // TODO: 설문 생성 페이지로 이동
              console.log('Create survey for version:', versionUuid);
            }}
          >
            <Plus className="mr-2 size-4" />
            새 설문 만들기
          </Button>
        </CardHeader>
        <CardContent>
          {surveys.length === 0 ? (
            <div className="text-muted-foreground py-8 text-center text-sm">
              이 버전에 연결된 설문이 없습니다.
            </div>
          ) : (
            <div className="space-y-2">
              {surveys.map((survey) => (
                <a
                  key={survey.surveyUuid}
                  href={`/games/${gameUuid}/versions/${versionUuid}/surveys/${survey.surveyUuid}`}
                  className="hover:bg-muted flex items-center justify-between rounded-lg border p-4 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="bg-primary/10 flex size-10 items-center justify-center rounded-lg">
                      <span className="text-primary text-lg">📋</span>
                    </div>
                    <div>
                      <p className="font-medium">{survey.surveyName}</p>
                      <p className="text-muted-foreground text-xs">
                        {survey.createdAt} 생성
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <span
                      className={`rounded px-2 py-1 text-xs font-medium ${
                        survey.status === 'ACTIVE'
                          ? 'bg-success/10 text-success'
                          : survey.status === 'DRAFT'
                            ? 'bg-muted text-muted-foreground'
                            : 'bg-destructive/10 text-destructive'
                      }`}
                    >
                      {survey.status}
                    </span>
                    <div className="text-right">
                      <p className="text-lg font-semibold">
                        {survey.responseCount}
                      </p>
                      <p className="text-muted-foreground text-xs">RESPONSES</p>
                    </div>
                  </div>
                </a>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
