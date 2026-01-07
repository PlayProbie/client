/**
 * 테스터 스트리밍 페이지
 *
 * 테스터가 게임을 스트리밍으로 플레이하는 페이지입니다.
 */
import { useEffect, useMemo, useRef } from 'react';
import { useParams } from 'react-router-dom';

import { Button } from '@/components/ui/button';
import { InlineAlert } from '@/components/ui/InlineAlert';
import { PageSpinner } from '@/components/ui/loading';
import {
  StreamPlayer,
  useGameStream,
  useSessionInfo,
  useSessionStatus,
  useSignal,
  useTerminateSession,
} from '@/features/game-streaming-session';
import { useToast } from '@/hooks/useToast';

export default function TesterPlaceholderPage() {
  const { surveyUuid } = useParams<{ surveyUuid: string }>();
  const { toast } = useToast();

  const isWebRtcSupported = useMemo(
    () => typeof RTCPeerConnection !== 'undefined',
    []
  );
  const AUTO_CONNECT_RETRY_INTERVAL_MS = 5000;

  // 세션 정보 조회
  const {
    data: sessionInfo,
    isLoading,
    isError,
    refetch,
  } = useSessionInfo(surveyUuid || '', !!surveyUuid);

  // WebRTC 스트리밍 연결 훅
  const {
    videoRef,
    isConnecting,
    isConnected,
    sessionUuid,
    connect,
    disconnect,
    sendInput,
  } = useGameStream({
    surveyUuid: surveyUuid || '',
    onConnected: () => {
      toast({
        variant: 'success',
        title: '스트리밍 연결 완료',
        description: '게임 화면이 곧 표시됩니다.',
      });
    },
    onError: (error) => {
      toast({
        variant: 'destructive',
        title: '스트리밍 연결 실패',
        description: error.message,
      });
    },
    onDisconnected: () => {
      toast({
        variant: 'default',
        title: '스트리밍이 종료되었습니다.',
      });
    },
  });

  // 세션 종료 mutation
  const terminateMutation = useTerminateSession(surveyUuid || '');
  const signalMutation = useSignal(surveyUuid || '');

  // Heartbeat 폴링 (세션 활성화 상태 확인)
  useSessionStatus(surveyUuid || '', sessionUuid || undefined, {
    enabled: !!surveyUuid && !!sessionUuid,
    onSessionExpired: () => {
      disconnect();
      toast({
        variant: 'warning',
        title: '세션이 만료되었습니다.',
        description: '다시 연결해주세요.',
      });
    },
  });

  // 자동 연결 (세션 가용 시 즉시 연결)
  const autoConnectAttemptedAtRef = useRef(0);
  const autoConnectSurveyRef = useRef<string | null>(null);

  useEffect(() => {
    if (!surveyUuid) return;
    if (autoConnectSurveyRef.current !== surveyUuid) {
      autoConnectSurveyRef.current = surveyUuid;
      autoConnectAttemptedAtRef.current = 0;
    }
  }, [surveyUuid]);

  useEffect(() => {
    if (!surveyUuid || !sessionInfo?.isAvailable) return;
    if (isConnected || isConnecting) return;

    const now = Date.now();
    if (
      now - autoConnectAttemptedAtRef.current <
      AUTO_CONNECT_RETRY_INTERVAL_MS
    ) {
      return;
    }

    autoConnectAttemptedAtRef.current = now;
    void connect();
  }, [
    surveyUuid,
    sessionInfo?.isAvailable,
    isConnected,
    isConnecting,
    connect,
    AUTO_CONNECT_RETRY_INTERVAL_MS,
  ]);

  // 연결 시작 핸들러 (수동 재시도용)
  const handleConnect = async () => {
    if (!surveyUuid || isConnecting || isConnected) return;
    await connect();
  };

  // 연결 종료 핸들러
  const handleDisconnect = () => {
    if (!surveyUuid || !sessionUuid) return;

    const disconnectSignal = btoa(
      JSON.stringify({
        type: 'client_disconnect',
        surveySessionUuid: sessionUuid,
        reason: 'user_exit',
        timestamp: Date.now(),
      })
    );
    signalMutation.mutate({ signalRequest: disconnectSignal });

    terminateMutation.mutate(
      { surveySessionUuid: sessionUuid, reason: 'user_exit' },
      {
        onSuccess: () => {
          disconnect();
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

  // 에러 상태 처리
  if (!surveyUuid) {
    return (
      <div className="mx-auto max-w-2xl space-y-6 py-10">
        <InlineAlert
          variant="error"
          title="잘못된 접근입니다."
        >
          설문 UUID를 확인해주세요.
        </InlineAlert>
      </div>
    );
  }

  if (!isWebRtcSupported) {
    return (
      <div className="mx-auto max-w-2xl space-y-6 py-10">
        <InlineAlert
          variant="warning"
          title="지원하지 않는 환경입니다."
        >
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
    <div className="mx-auto flex max-w-4xl flex-col gap-6 px-4 py-10">
      {/* 헤더 정보 */}
      <div className="space-y-2">
        <p className="text-muted-foreground text-xs font-semibold tracking-wide uppercase">
          Game Streaming
        </p>
        <h1 className="text-2xl font-bold">{gameName}</h1>
        {streamSettings && (
          <p className="text-muted-foreground text-sm">
            {streamSettings.resolution} • {streamSettings.fps} FPS
          </p>
        )}
      </div>

      {/* 스트리밍 플레이어 */}
      <StreamPlayer
        videoRef={videoRef}
        isConnected={isConnected}
        isConnecting={isConnecting}
        onDisconnect={handleDisconnect}
        sendInput={sendInput}
        className="w-full"
      />

      {/* 상태 메시지 및 컨트롤 */}
      {!isConnected && !isConnecting && (
        <>
          {isAvailable ? (
            <div className="flex flex-col items-center gap-4 py-8">
              <p className="text-muted-foreground">
                세션에 연결하는 중입니다... 잠시만 기다려주세요.
              </p>
              <Button
                onClick={handleConnect}
                variant="outline"
              >
                연결이 안 되나요? 수동으로 연결하기
              </Button>
            </div>
          ) : (
            <InlineAlert
              variant="warning"
              title="현재 접속 가능한 세션이 없습니다."
            >
              잠시 후 다시 시도해주세요.
            </InlineAlert>
          )}
        </>
      )}

      {/* 연결 중 상태 */}
      {isConnecting && (
        <div className="flex items-center gap-3">
          <div className="border-primary h-5 w-5 animate-spin rounded-full border-2 border-t-transparent" />
          <span className="text-muted-foreground text-sm">
            스트리밍 연결 중...
          </span>
        </div>
      )}

      {/* 연결됨 상태 - 하단 컨트롤 */}
      {isConnected && sessionUuid && (
        <div className="flex items-center justify-between">
          <span className="text-muted-foreground text-xs">
            세션: {sessionUuid.slice(0, 8)}...
          </span>
          <Button
            variant="destructive"
            size="sm"
            onClick={handleDisconnect}
            disabled={terminateMutation.isPending}
          >
            {terminateMutation.isPending ? '종료 중...' : '스트리밍 종료'}
          </Button>
        </div>
      )}
    </div>
  );
}
