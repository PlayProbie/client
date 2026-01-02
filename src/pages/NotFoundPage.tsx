import { Home, Search } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function NotFoundPage() {
  return (
    <div className="bg-background flex min-h-screen flex-col items-center justify-center px-4">
      {/* Blueprint Grid Background */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `
            linear-gradient(to right, currentColor 1px, transparent 1px),
            linear-gradient(to bottom, currentColor 1px, transparent 1px)
          `,
          backgroundSize: '48px 48px',
        }}
      />

      <div className="relative z-10 text-center">
        {/* Error Code */}
        <div className="relative mb-6">
          <span className="text-primary/10 text-[12rem] leading-none font-bold select-none">
            404
          </span>
          <div className="absolute inset-0 flex items-center justify-center">
            <Search className="text-primary size-20 stroke-2" />
          </div>
        </div>

        {/* Heading */}
        <h1 className="text-foreground text-2xl font-semibold tracking-tight">
          페이지를 찾을 수 없습니다
        </h1>

        {/* Description */}
        <p className="text-muted-foreground mx-auto mt-3 max-w-md leading-relaxed">
          요청하신 페이지가 존재하지 않거나,
          <br />
          이동되었거나, 삭제되었을 수 있습니다.
        </p>

        {/* Action Buttons */}
        <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
          <Link
            to="/"
            className="bg-primary text-primary-foreground hover:bg-primary/90 inline-flex items-center gap-2 rounded-lg px-6 py-3 font-medium shadow-sm transition-colors"
          >
            <Home className="size-4 stroke-2" />
            홈으로 돌아가기
          </Link>
          <button
            onClick={() => window.history.back()}
            className="text-muted-foreground hover:text-foreground hover:bg-muted inline-flex items-center gap-2 rounded-lg px-6 py-3 font-medium transition-colors"
          >
            이전 페이지로
          </button>
        </div>

        {/* Error Code Badge */}
        <div className="mt-12">
          <span className="bg-muted text-muted-foreground rounded-full px-3 py-1 font-mono text-sm">
            Error Code: 404 Not Found
          </span>
        </div>
      </div>
    </div>
  );
}
