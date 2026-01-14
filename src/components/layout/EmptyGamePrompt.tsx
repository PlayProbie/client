import { Gamepad2 } from 'lucide-react';

import { Button } from '@/components/ui';

interface EmptyGamePromptProps {
  onAddGame: () => void;
}

/**
 * 게임이 없을 때 표시되는 빈 화면
 */
function EmptyGamePrompt({ onAddGame }: EmptyGamePromptProps) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-6 p-8">
      <div className="bg-muted flex size-24 items-center justify-center rounded-full">
        <Gamepad2 className="text-muted-foreground size-12" />
      </div>
      <div className="text-center">
        <h2 className="text-foreground mb-2 text-xl font-semibold">
          게임을 추가하세요
        </h2>
        <p className="text-muted-foreground max-w-sm text-sm">
          게임을 추가하면 버전 관리, 빌드 업로드, 설문 조사를 시작할 수
          있습니다.
        </p>
      </div>
      <Button onClick={onAddGame}>첫 게임 추가하기</Button>
    </div>
  );
}

export default EmptyGamePrompt;
