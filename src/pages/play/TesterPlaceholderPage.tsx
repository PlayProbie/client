/**
 * 테스터 스트리밍 페이지
 *
 * 테스터가 게임을 스트리밍으로 플레이하는 페이지입니다.
 * 밝은 테마의 게임 스트리밍 UI를 제공합니다.
 */
import { Clock, Gamepad2, Wifi, WifiOff } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/Dialog';
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

/** 세션 최대 시간 (초) - 2분 */
const SESSION_MAX_DURATION_SECONDS = 120;

/** 남은 시간 포맷팅 */
function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

export default function TesterPlaceholderPage() {
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

  // 남은 시간 경고 상태
  const isTimeWarning = remainingTime <= 30 && remainingTime > 0;
  const isTimeCritical = remainingTime <= 10 && remainingTime > 0;

  return (
    <div className="bg-background flex min-h-screen flex-col">
      {/* 상단 헤더 바 */}
      <header className="bg-surface flex items-center justify-between border-b border-slate-200 px-4 py-3 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="bg-primary/10 flex h-9 w-9 items-center justify-center rounded-lg">
            <Gamepad2 className="text-primary h-5 w-5" />
          </div>
          <div>
            <h1 className="text-foreground text-base font-semibold">
              {gameName}
            </h1>
            {streamSettings && (
              <p className="text-muted-foreground text-xs">
                {streamSettings.resolution} • {streamSettings.fps} FPS
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-4">
          {/* 연결 상태 표시 */}
          <div className="flex items-center gap-2">
            {isConnected ? (
              <>
                <Wifi className="h-4 w-4 text-emerald-600" />
                <span className="text-sm font-medium text-emerald-600">
                  연결됨
                </span>
              </>
            ) : isConnecting ? (
              <>
                <div className="border-primary h-4 w-4 animate-spin rounded-full border-2 border-t-transparent" />
                <span className="text-muted-foreground text-sm">
                  연결 중...
                </span>
              </>
            ) : (
              <>
                <WifiOff className="text-muted-foreground h-4 w-4" />
                <span className="text-muted-foreground text-sm">연결 대기</span>
              </>
            )}
          </div>

          {/* 남은 시간 표시 */}
          {isConnected && (
            <div
              className={`flex items-center gap-2 rounded-lg px-3 py-1.5 ${
                isTimeCritical
                  ? 'animate-pulse bg-red-100 text-red-600'
                  : isTimeWarning
                    ? 'bg-amber-100 text-amber-600'
                    : 'bg-slate-100 text-slate-600'
              }`}
            >
              <Clock className="h-4 w-4" />
              <span className="font-mono text-sm font-medium">
                {formatTime(remainingTime)}
              </span>
            </div>
          )}

          {/* 세션 종료 버튼 */}
          {isConnected && sessionUuid && (
            <Button
              variant="destructive"
              size="sm"
              onClick={handleDisconnect}
              disabled={terminateMutation.isPending}
            >
              {terminateMutation.isPending ? '종료 중...' : '게임 종료'}
            </Button>
          )}
        </div>
      </header>

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

      {/* 하단 안내 바 */}
      <footer className="bg-surface border-t border-slate-200 px-4 py-3">
        <div className="mx-auto flex max-w-6xl items-center justify-between">
          <p className="text-muted-foreground text-xs">
            게임 스트리밍은 Chrome 최신 버전 / PC 환경에서 최적화되어 있습니다.
          </p>
          {isConnected && sessionUuid && (
            <p className="text-muted-foreground text-xs">
              세션: {sessionUuid.slice(0, 8)}...
            </p>
          )}
        </div>
      </footer>

      {/* 종료 완료 모달 */}
      <Dialog
        open={showCompletionModal}
        onOpenChange={setShowCompletionModal}
      >
        <DialogContent showCloseButton={false}>
          <DialogHeader>
            <DialogTitle>게임 플레이가 종료되었습니다</DialogTitle>
            <DialogDescription>
              플레이해주셔서 감사합니다. 설문 페이지에서 피드백을 남겨주세요.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => setShowCompletionModal(false)}
            >
              닫기
            </Button>
            <Button
              disabled={!sessionUuid}
              onClick={() => {
                if (!sessionUuid) return;
                const baseUrl = import.meta.env.VITE_CLIENT_BASE_URL || '';
                window.location.href = `${baseUrl}/surveys/session/${sessionUuid}`;
              }}
            >
              설문 참여하기
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
