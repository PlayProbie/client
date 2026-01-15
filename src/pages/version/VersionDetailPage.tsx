/**
 * VersionDetailPage
 *
 * 버전 선택 시 표시되는 페이지
 * - 빌드 파일 업로드 영역
 * - 해당 버전의 설문 리스트
 * - 설문 선택 시 인라인 대시보드
 */

import { Plus } from 'lucide-react';
import { useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import { Button, Card, CardContent, CardHeader, CardTitle } from '@/components/ui';
import { PageSpinner } from '@/components/ui';
import {
  BuildsTable,
  BuildUploadModal,
  useBuildsQuery,
} from '@/features/game-streaming';
import { useVersionDetailQuery, useVersionSurveysQuery } from '@/features/version';

import { InlineSurveyDashboard } from './components/InlineSurveyDashboard';

interface Survey {
  surveyUuid: string;
  surveyName: string;
  status: 'DRAFT' | 'ACTIVE' | 'CLOSED';
  responseCount: number;
  createdAt: string;
}

export default function VersionDetailPage() {
  const navigate = useNavigate();
  const { gameUuid, versionUuid } = useParams<{
    gameUuid: string;
    versionUuid: string;
  }>();

  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [selectedSurvey, setSelectedSurvey] = useState<Survey | null>(null);

  const { data: version, isLoading: isVersionLoading } = useVersionDetailQuery(
    versionUuid || ''
  );
  // 버전별 설문 조회 (실제 API)
  const { data: versionSurveys = [], isLoading: isSurveysLoading } = useVersionSurveysQuery(
    versionUuid || ''
  );
  const { data: builds, isLoading: isBuildsLoading } = useBuildsQuery(
    gameUuid || ''
  );

  // 현재 버전에 해당하는 빌드만 필터링
  const versionBuilds = useMemo(
    () => {
      return builds?.filter(
        (build) => build.version === version?.versionName && build.status !== 'DELETED'
      );
    },
    [builds, version]
  );

  // API에서 받은 설문 데이터를 Survey 타입으로 변환
  const surveys: Survey[] = versionSurveys.map((survey) => ({
    surveyUuid: survey.surveyUuid,
    surveyName: survey.surveyName,
    status: survey.status,
    responseCount: 0,
    createdAt: survey.createdAt.split('T')[0],
  }));

  if (isVersionLoading || isSurveysLoading || isBuildsLoading) {
    return <PageSpinner message="버전 정보를 불러오는 중..." />;
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Builds 섹션 */}
        <Card className="flex flex-col">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Builds</CardTitle>
            <Button
              size="sm"
              onClick={() => setIsUploadModalOpen(true)}
              disabled={!version}
            >
              <Plus className="mr-2 size-4" />
              Upload Build
            </Button>
          </CardHeader>
          <CardContent className="flex-1">
            {!versionBuilds || versionBuilds.length === 0 ? (
              <div className="border-muted flex min-h-[200px] flex-col items-center justify-center rounded-lg border-2 border-dashed p-8">
                <p className="text-muted-foreground mb-4 text-sm">
                  첫 빌드를 업로드하세요
                </p>
                <Button
                  variant="outline"
                  onClick={() => setIsUploadModalOpen(true)}
                  disabled={!version}
                >
                  <Plus className="mr-2 size-4" />
                  Upload Build
                </Button>
              </div>
            ) : (
              <BuildsTable builds={versionBuilds} />
            )}
            <p className="text-muted-foreground mt-4 text-xs">
              Tip: ExecutablePath는 업로드 폴더 내 실행 파일의 상대 경로입니다.
              예) /Game/Binaries/Win64/MyGame.exe
            </p>
          </CardContent>
        </Card>

        {/* Upload Modal */}
        {gameUuid && (
          <BuildUploadModal
            gameUuid={gameUuid}
            gameName=""
            open={isUploadModalOpen}
            onOpenChange={setIsUploadModalOpen}
            defaultVersion={version?.versionName}
          />
        )}

        {/* Surveys 섹션 */}
        <Card className="flex flex-col">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Surveys</CardTitle>
            <Button
              size="sm"
              onClick={() => {
                navigate(`/games/${gameUuid}/surveys/design`, {
                  state: { versionUuid },
                });
              }}
            >
              <Plus className="mr-2 size-4" />
              새 설문 만들기
            </Button>
          </CardHeader>
          <CardContent className="flex-1">
            {surveys.length === 0 ? (
              <div className="border-muted flex min-h-[200px] flex-col items-center justify-center rounded-lg border-2 border-dashed p-8">
                <p className="text-muted-foreground mb-4 text-sm">
                  이 버전에 연결된 설문이 없습니다.
                </p>
                <Button
                  variant="outline"
                  onClick={() => {
                    navigate(`/games/${gameUuid}/surveys/design`, {
                      state: { versionUuid },
                    });
                  }}
                >
                  <Plus className="mr-2 size-4" />
                  새 설문 만들기
                </Button>
              </div>
            ) : (
              <div className="space-y-2">
                {surveys.map((survey) => (
                  <button
                    key={survey.surveyUuid}
                    type="button"
                    onClick={() => setSelectedSurvey(survey)}
                    className={`hover:bg-muted flex w-full items-center justify-between rounded-lg border p-4 text-left transition-colors ${
                      selectedSurvey?.surveyUuid === survey.surveyUuid
                        ? 'ring-primary border-primary ring-2'
                        : ''
                    }`}
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
                  </button>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* 인라인 설문 대시보드 */}
      {selectedSurvey && (
        <InlineSurveyDashboard
          surveyUuid={selectedSurvey.surveyUuid}
          surveyName={selectedSurvey.surveyName}
          surveyStatus={selectedSurvey.status}
          onClose={() => setSelectedSurvey(null)}
        />
      )}
    </div>
  );
}

