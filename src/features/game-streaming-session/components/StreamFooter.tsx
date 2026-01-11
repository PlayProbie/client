interface StreamFooterProps {
  isConnected: boolean;
  sessionUuid?: string;
}

export function StreamFooter({ isConnected, sessionUuid }: StreamFooterProps) {
  return (
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
  );
}
