/**
 * SurveyListPage - 게임 내 설문 목록 페이지
 * Route: /games/:gameUuid/surveys
 */
import { Plus } from 'lucide-react';
import { Link, useNavigate, useParams } from 'react-router-dom';

import { Button, InlineAlert, Skeleton } from '@/components/ui';
import { StatusBadge, type StatusVariant } from '@/components/ui/StatusBadge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/Table';
import { useSurveys } from '@/features/game-streaming-survey';
import type { SurveyStatus } from '@/features/game-streaming-survey/types';

const STATUS_MAP: Record<
  SurveyStatus,
  { variant: StatusVariant; label: string }
> = {
  DRAFT: { variant: 'muted', label: 'Draft' },
  ACTIVE: { variant: 'success', label: 'Active' },
  CLOSED: { variant: 'destructive', label: 'Closed' },
};

export default function SurveyListPage() {
  const { gameUuid } = useParams<{ gameUuid: string }>();
  const {
    data: surveys,
    isLoading,
    isError,
    refetch,
  } = useSurveys({
    gameUuid,
    enabled: !!gameUuid,
  });

  const navigate = useNavigate();
  const handleRowClick = (surveyUuid: string) => {
    if (!gameUuid) return;
    navigate(`/games/${gameUuid}/surveys/${surveyUuid}/overview`);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Surveys</h2>
          <p className="text-muted-foreground mt-1">
            게임별 설문을 관리하고 배포합니다.
          </p>
        </div>
        <Button
          variant="outline"
          asChild
        >
          <Link to={`/games/${gameUuid}/surveys/design/step-0`}>
            <Plus className="mr-2 size-4" />
            Create Survey
          </Link>
        </Button>
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="space-y-2">
          <div className="border-border bg-card rounded-md border">
            <div className="space-y-2 border-b p-4">
              <Skeleton className="h-6 w-1/4" />
            </div>
            <div className="space-y-4 p-4">
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
            </div>
          </div>
        </div>
      ) : isError ? (
        <InlineAlert
          variant="error"
          title="목록 로딩 실패"
          actions={
            <Button
              size="sm"
              variant="outline"
              onClick={() => refetch()}
            >
              다시 시도
            </Button>
          }
        >
          설문 목록을 불러오지 못했습니다.
        </InlineAlert>
      ) : !surveys || surveys.length === 0 ? (
        <div className="animate-in fade-in-50 flex min-h-[400px] flex-col items-center justify-center rounded-lg border border-dashed p-8 text-center">
          <div className="bg-secondary/50 mx-auto flex size-12 items-center justify-center rounded-full">
            <Plus className="text-muted-foreground size-6" />
          </div>
          <h3 className="mt-4 text-lg font-semibold">No surveys yet</h3>
          <p className="text-muted-foreground mb-4 max-w-sm text-sm">
            아직 생성된 설문이 없습니다. 새로운 설문을 생성하여 테스트를
            시작해보세요.
          </p>
          <Button
            variant="outline"
            asChild
          >
            <Link to={`/games/${gameUuid}/surveys/design/step-0`}>Create Survey</Link>
          </Button>
        </div>
      ) : (
        <div className="bg-card rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>이름</TableHead>
                <TableHead>상태</TableHead>
                <TableHead>생성일</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
            {surveys.map((survey) => {
              const statusInfo = STATUS_MAP[survey.status];
              return (
                <TableRow
                  key={survey.surveyUuid}
                  className="cursor-pointer hover:bg-muted/40"
                  onClick={() => handleRowClick(survey.surveyUuid)}
                >
                  <TableCell className="font-medium">
                    {survey.surveyName}
                  </TableCell>
                  <TableCell>
                    <StatusBadge
                      variant={statusInfo.variant}
                      label={statusInfo.label}
                    />
                  </TableCell>
                  <TableCell>
                    {new Date(survey.createdAt).toLocaleDateString()}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
      )}
    </div>
  );
}
