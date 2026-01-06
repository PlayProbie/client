import { useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';

import { Button } from '@/components/ui/button';
import { InlineAlert } from '@/components/ui/InlineAlert';
import { PageSpinner } from '@/components/ui/loading';
import {
  useSessionInfo,
  useSignal,
  useTerminateSession,
} from '@/features/game-streaming-session';
import { useToast } from '@/hooks/useToast';

export default function TesterPlaceholderPage() {
  const { surveyUuid } = useParams<{ surveyUuid: string }>();
  const { toast } = useToast();
  const [surveySessionUuid, setSurveySessionUuid] = useState<string | null>(
    null
  );

  const isWebRtcSupported = useMemo(
    () => typeof RTCPeerConnection !== 'undefined',
    []
  );

  const {
    data: sessionInfo,
    isLoading,
    isError,
    refetch,
  } = useSessionInfo(surveyUuid || '', !!surveyUuid);
  const startMutation = useSignal(surveyUuid || '');
  const terminateMutation = useTerminateSession(surveyUuid || '');

  const handleStart = () => {
    if (!surveyUuid) return;

    startMutation.mutate(
      { signalRequest: btoa(`placeholder-${Date.now()}`) },
      {
        onSuccess: (data) => {
          setSurveySessionUuid(data.surveySessionUuid);
          toast({
            variant: 'success',
            title: '스트리밍 세션이 생성되었습니다.',
          });
        },
        onError: (error) => {
          toast({
            variant: 'destructive',
            title: '스트리밍 연결 실패',
            description: error.message,
          });
        },
      }
    );
  };

  const handleTerminate = () => {
    if (!surveyUuid || !surveySessionUuid) return;

    terminateMutation.mutate(
      { surveySessionUuid, reason: 'user_exit' },
      {
        onSuccess: () => {
          setSurveySessionUuid(null);
          toast({
            variant: 'success',
            title: '세션이 종료되었습니다.',
          });
        },
        onError: (error) => {
          toast({
            variant: 'destructive',
            title: '세션 종료 실패',
            description: error.message,
          });
        },
      }
    );
  };

  if (!surveyUuid) {
    return (
      <div className="mx-auto max-w-2xl space-y-6 py-10">
        <InlineAlert variant="error" title="잘못된 접근입니다.">
          설문 UUID를 확인해주세요.
        </InlineAlert>
      </div>
    );
  }

  if (!isWebRtcSupported) {
    return (
      <div className="mx-auto max-w-2xl space-y-6 py-10">
        <InlineAlert variant="warning" title="지원하지 않는 환경입니다.">
          Chrome 최신 버전/PC 환경에서 다시 접속해주세요.
        </InlineAlert>
      </div>
    );
  }

  if (isLoading) {
    return <PageSpinner message="스트리밍 세션을 확인하는 중..." />;
  }

  if (isError || !sessionInfo) {
    return (
      <div className="mx-auto max-w-2xl space-y-6 py-10">
        <InlineAlert
          variant="error"
          title="세션 정보를 불러오지 못했습니다."
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
          요청에 실패했습니다. 다시 시도해주세요.
        </InlineAlert>
      </div>
    );
  }

  const { gameName, isAvailable, streamSettings } = sessionInfo;

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-6 py-10">
      <div className="space-y-2">
        <p className="text-muted-foreground text-xs font-semibold uppercase tracking-wide">
          Tester Experience
        </p>
        <h1 className="text-2xl font-bold">{gameName}</h1>
        <p className="text-muted-foreground text-sm">
          해상도 {streamSettings.resolution}, FPS {streamSettings.fps}
        </p>
      </div>

      {isAvailable ? (
        <InlineAlert variant="success" title="스트리밍 연결 준비 완료">
          Start Streaming 버튼을 눌러 연결을 시작하세요.
        </InlineAlert>
      ) : (
        <InlineAlert variant="warning" title="현재 접속 가능한 세션이 없습니다.">
          잠시 후 다시 시도해주세요.
        </InlineAlert>
      )}

      <div className="flex flex-wrap items-center gap-3">
        <Button
          onClick={handleStart}
          disabled={
            !isAvailable || startMutation.isPending || !!surveySessionUuid
          }
        >
          {startMutation.isPending
            ? '스트리밍 연결 중...'
            : surveySessionUuid
              ? '연결됨'
              : 'Start Streaming'}
        </Button>
        {surveySessionUuid && (
          <Button
            variant="outline"
            onClick={handleTerminate}
            disabled={terminateMutation.isPending}
          >
            종료하기
          </Button>
        )}
      </div>

      {surveySessionUuid && (
        <InlineAlert variant="info" title="플레이 화면 준비 중">
          스트리밍 플레이 UI는 준비 중입니다. 세션 UUID: {surveySessionUuid}
        </InlineAlert>
      )}
    </div>
  );
}
