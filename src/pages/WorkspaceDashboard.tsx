import { PageLayout } from '@/components/layout';

export default function WorkspaceDashboard() {
  return (
    <PageLayout>
      <div className="mx-auto max-w-4xl">
        <div className="bg-surface border-border mb-6 rounded-xl border p-8 shadow-sm">
          <h2 className="text-foreground mb-3 text-2xl font-bold">
            PlayProbie에 오신 것을 환영합니다! 👋
          </h2>
          <p className="text-muted-foreground leading-relaxed">
            사이드바 메뉴를 사용하여 다양한 기능에 접근할 수 있습니다.
            <br />
            플레이테스트, 설문 관리, 리워드 설정 등 다양한 기능을 활용해보세요.
          </p>
        </div>

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div className="bg-surface border-border rounded-xl border p-6 shadow-sm">
            <p className="text-muted-foreground mb-1 text-sm font-medium">
              등록된 게임
            </p>
            <p className="text-foreground text-3xl font-bold">3</p>
          </div>
          <div className="bg-surface border-border rounded-xl border p-6 shadow-sm">
            <p className="text-muted-foreground mb-1 text-sm font-medium">
              진행 중인 테스트
            </p>
            <p className="text-foreground text-3xl font-bold">2</p>
          </div>
          <div className="bg-surface border-border rounded-xl border p-6 shadow-sm">
            <p className="text-muted-foreground mb-1 text-sm font-medium">
              수집된 응답
            </p>
            <p className="text-foreground text-3xl font-bold">128</p>
          </div>
        </div>
      </div>
    </PageLayout>
  );
}
