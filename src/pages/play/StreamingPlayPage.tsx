/**
 * 테스터 스트리밍 페이지
 *
 * 테스터가 게임을 스트리밍으로 플레이하는 페이지입니다.
 * 밝은 테마의 게임 스트리밍 UI를 제공합니다.
 */
import { useEffect, useMemo, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';

import { Button } from '@/components/ui/button';
import { InlineAlert } from '@/components/ui/InlineAlert';
import { PageSpinner } from '@/components/ui/loading';
import {
  StreamCompletionDialog,
  StreamFooter,
  StreamHeader,
  StreamPlayer,
  useGameStream,
  useSessionInfo,
  useSessionStatus,
  useSignal,
  useTerminateSession,
} from '@/features/game-streaming-session';
import { useToast } from '@/hooks/useToast';

/** 세션 최대 시간 (초) - 2분 */
const SESSION_MAX_DURATION_SECONDS = 120;

export default function StreamingPlayPage() {
  const { surveyUuid } = useParams<{ surveyUuid: string }>();
  const { toast } = useToast();

  const isWebRtcSupported = useMemo(
    () => typeof RTCPeerConnection !== 'undefined',
    []
  );

  // 종료 완료 모달 상태
  const [showCompletionModal, setShowCompletionModal] = useState(false);

  // 남은 시간 타이머
  const [remainingTime, setRemainingTime] = useState(
    SESSION_MAX_DURATION_SECONDS
  );

  // 수동 종료 여부 (버튼 클릭 또는 타임아웃)
  const isManuallyTerminated = useRef(false);

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
    audioRef,
    isConnecting,
    isConnected,
    sessionUuid,
    connect,
    disconnect,
  } = useGameStream({
    surveyUuid: surveyUuid || '',
    onConnected: () => {
      setRemainingTime(SESSION_MAX_DURATION_SECONDS);
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
      // 수동으로 종료한 경우에는 세션 만료 알림을 띄우지 않음
      if (isManuallyTerminated.current) return;

      disconnect();
      toast({
        variant: 'warning',
        title: '세션이 만료되었습니다.',
        description: '다시 연결해주세요.',
      });
    },
  });

  // 남은 시간 카운트다운
  useEffect(() => {
    if (!isConnected) return;

    const timer = setInterval(() => {
      setRemainingTime((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isConnected]);

  // 시간 만료 시 자동 종료
  useEffect(() => {
    if (remainingTime === 0 && isConnected) {
      handleDisconnect();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [remainingTime, isConnected]);

  // 연결 시작 핸들러 (수동 재시도용)
  const handleConnect = async () => {
    if (!surveyUuid || isConnecting || isConnected) return;
    await connect();
  };

  // 연결 종료 핸들러
  const handleDisconnect = () => {
    if (!surveyUuid || !sessionUuid) return;

    // 수동 종료 플래그 설정
    isManuallyTerminated.current = true;

    const disconnectSignal = btoa(
      JSON.stringify({
        type: 'client_disconnect',
        surveySessionUuid: sessionUuid,
        reason: 'USER_EXIT',
        timestamp: Date.now(),
      })
    );
    signalMutation.mutate({ signalRequest: disconnectSignal });

    terminateMutation.mutate(
      {
        surveySessionUuid: sessionUuid,
        reason: 'GAME_FINISHED',
        proceedToInterview: true,
      },
      {
        onSuccess: () => {
          disconnect();
          setShowCompletionModal(true);
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
      <div className="bg-background flex min-h-screen items-center justify-center px-4">
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
      <div className="bg-background flex min-h-screen items-center justify-center px-4">
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
    return (
      <div className="bg-background flex min-h-screen items-center justify-center">
        <PageSpinner message="스트리밍 세션을 확인하는 중..." />
      </div>
    );
  }

  if (isError || !sessionInfo) {
    return (
      <div className="bg-background flex min-h-screen items-center justify-center px-4">
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
    <div className="bg-background flex min-h-screen flex-col">
      <StreamHeader
        gameName={gameName}
        streamSettings={streamSettings}
        isConnected={isConnected}
        isConnecting={isConnecting}
        isTerminating={terminateMutation.isPending}
        sessionUuid={sessionUuid || undefined}
        remainingTime={remainingTime}
        onDisconnect={handleDisconnect}
      />

      {/* 메인 스트리밍 영역 */}
      <main className="flex flex-1 flex-col items-center justify-center bg-slate-100 p-4">
        <div className="w-full max-w-6xl">
          <StreamPlayer
            videoRef={videoRef}
            audioRef={audioRef}
            isConnected={isConnected}
            isConnecting={isConnecting}
            isAvailable={isAvailable}
            onConnect={handleConnect}
            onDisconnect={handleDisconnect}
            className="w-full rounded-lg shadow-lg"
          />
        </div>
      </main>

      <StreamFooter
        isConnected={isConnected}
        sessionUuid={sessionUuid || undefined}
      />

      <StreamCompletionDialog
        open={showCompletionModal}
        onOpenChange={setShowCompletionModal}
        sessionUuid={sessionUuid || undefined}
      />
    </div>
  );
}
