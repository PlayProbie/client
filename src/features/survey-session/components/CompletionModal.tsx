/**
 * CompletionModal - 설문 완료 모달
 * 설문이 완료되면 3초 후 표시되며, 닫기 버튼으로 닫을 수 있음
 */

import { X } from 'lucide-react';

import { Button } from '@/components/ui';

interface CompletionModalProps {
  onClose: () => void;
}

export function CompletionModal({ onClose }: CompletionModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* 배경 오버레이 */}
      <button
        type="button"
        className="absolute inset-0 h-full w-full cursor-default bg-black/50 border-none"
        onClick={onClose}
        aria-label="모달 닫기"
        tabIndex={0}
      />

      {/* 모달 컨텐츠 */}
      <div className="bg-background relative z-10 mx-4 w-full max-w-md rounded-lg p-6 shadow-lg">
        {/* 닫기 버튼 */}
        <button
          type="button"
          onClick={onClose}
          className="text-muted-foreground hover:text-foreground absolute top-4 right-4 transition-colors"
          aria-label="닫기"
        >
          <X className="size-5" />
        </button>

        <div className="space-y-6 text-center">
          <div className="space-y-4">
            <h1 className="text-2xl font-bold tracking-tight">설문 참여 완료</h1>
            <p className="text-muted-foreground">
              참여해 주셔서 진심으로 감사드립니다.
              <br />
              귀하의 소중한 의견은 게임 경험 개선에 큰 도움이 됩니다.
            </p>
          </div>

          <div className="bg-card rounded-lg border p-6 shadow-sm">
            <h2 className="mb-3 text-lg font-semibold">PlayProbie</h2>
            <p className="text-muted-foreground mb-4 text-sm">
              AI 기술을 활용한 게임 테스트 자동화 서비스를 만나보세요.
            </p>

            <Button
              className="bg-primary w-full text-white"
              size="md"
            >
              서비스 소개 보러가기
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
