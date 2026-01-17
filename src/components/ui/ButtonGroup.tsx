import { Label } from '@/components/ui/Label';
import { cn } from '@/lib/utils';

type ButtonGroupOption = {
  value: string;
  label: string;
};

type ButtonGroupProps = {
  /** 폼 필드의 고유 ID */
  id: string;
  /** 레이블 텍스트 */
  label: string;
  /** 선택 옵션 목록 */
  options: ButtonGroupOption[];
  /** 현재 선택된 값 (controlled) */
  value?: string;
  /** 값 변경 핸들러 (controlled) */
  onChange: (value: string) => void;
  /** 컬럼 수 (기본값: 3) */
  columns?: 2 | 3 | 4;
  /** 추가 CSS 클래스 */
  className?: string;
  /** 에러 메시지 */
  error?: string;
};

const columnClasses = {
  2: 'grid-cols-2',
  3: 'grid-cols-2 sm:grid-cols-3',
  4: 'grid-cols-2 sm:grid-cols-4',
};

/**
 * 단일 선택 버튼 그룹 (라디오 스타일, controlled)
 */
function ButtonGroup({
  id,
  label,
  options,
  value,
  onChange,
  columns = 3,
  className,
  error,
}: ButtonGroupProps) {
  return (
    <div className={cn('flex flex-col items-start gap-2', className)}>
      <Label htmlFor={id}>{label}</Label>
      <div className={cn('grid w-full gap-2', columnClasses[columns])}>
        {options.map((option) => (
          <label
            key={option.value}
            className="border-input hover:bg-muted/50 has-checked:border-primary has-checked:bg-primary has-checked:text-primary-foreground flex cursor-pointer items-center justify-center rounded-md border p-3 text-center transition-colors"
          >
            <input
              type="radio"
              name={id}
              value={option.value}
              checked={value === option.value}
              onChange={(e) => onChange(e.target.value)}
              className="sr-only"
            />
            <span className="text-sm font-medium">{option.label}</span>
          </label>
        ))}
      </div>
      {error && <p className="text-destructive text-sm">{error}</p>}
    </div>
  );
}

export { ButtonGroup };
export type { ButtonGroupOption, ButtonGroupProps };
