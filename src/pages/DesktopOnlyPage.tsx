import { MonitorSmartphone } from 'lucide-react';

/**
 * DesktopOnlyPage - 모바일/태블릿 접속 시 Desktop 접속 안내 페이지
 */
function DesktopOnlyPage() {
  return (
    <div className="from-background to-muted flex min-h-screen items-center justify-center bg-gradient-to-br p-6">
      <div className="text-center">
        <div className="bg-primary/10 mx-auto mb-6 inline-flex h-20 w-20 items-center justify-center rounded-full">
          <MonitorSmartphone className="text-primary h-10 w-10" />
        </div>

        <h1 className="text-foreground mb-3 text-2xl font-bold">
          Desktop 전용 서비스입니다
        </h1>

        <p className="text-muted-foreground mx-auto mb-6 max-w-md text-base">
          PlayProbie는 <strong>데스크톱 환경</strong>에서 최적화되어 있습니다.
          <br />
          원활한 사용을 위해 <strong>PC 또는 노트북</strong>에서 접속해 주세요.
        </p>

        <div className="bg-muted/50 mx-auto max-w-sm rounded-lg p-4">
          <p className="text-muted-foreground text-sm">
            💡 <strong>Tip:</strong> Chrome, Safari, Edge 등 최신 브라우저를
            사용하시면 더욱 쾌적한 사용이 가능합니다.
          </p>
        </div>
      </div>
    </div>
  );
}

export default DesktopOnlyPage;
