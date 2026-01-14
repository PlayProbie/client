import { cn } from '@/lib/utils';

interface GameIconButtonProps {
  name: string;
  iconUrl?: string;
  isSelected: boolean;
  onClick: () => void;
}

/**
 * 개별 게임 아이콘 버튼
 * - 기본: 게임 이름 첫 글자
 * - iconUrl 있으면 이미지 표시
 */
function GameIconButton({
  name,
  iconUrl,
  isSelected,
  onClick,
}: GameIconButtonProps) {
  // 게임 이름 첫 글자 (한글/영문 모두 지원)
  const initial = name.charAt(0).toUpperCase();

  return (
    <button
      type="button"
      onClick={onClick}
      title={name}
      className={cn(
        'flex size-12 items-center justify-center rounded-xl transition-all',
        'bg-muted hover:bg-muted/80',
        isSelected && 'ring-primary ring-2 ring-offset-2'
      )}
    >
      {iconUrl ? (
        <img
          src={iconUrl}
          alt={name}
          className="size-full rounded-xl object-cover"
        />
      ) : (
        <span className="text-foreground text-lg font-semibold">
          {initial}
        </span>
      )}
    </button>
  );
}

export default GameIconButton;
