import { Label } from '@/components/ui/Label';
import { cn } from '@/lib/utils';

type CheckboxOption = {
  value: string;
  label: string;
};

type CheckboxGroupProps = {
  /** 폼 필드의 고유 ID */
  id: string;
  /** 레이블 텍스트 */
  label: string;
  /** 선택 옵션 목록 */
  options: CheckboxOption[];
  /** 현재 선택된 값 배열 (controlled) */
  value: string[];
  /** 값 변경 핸들러 (controlled) */
  onChange: (value: string[]) => void;
  /** 컬럼 수 (기본값: 3) */
  columns?: 2 | 3 | 4;
  /** 추가 CSS 클래스 */
  className?: string;
  /** 에러 메시지 */
  error?: string;
  /** 최대 선택 가능 개수 */
  maxSelection?: number;
};

const columnClasses = {
  2: 'grid-cols-2',
  3: 'grid-cols-2 sm:grid-cols-3',
  4: 'grid-cols-2 sm:grid-cols-4',
};

/**
 * 다중 선택 체크박스 그룹 (controlled)
 */
function CheckboxGroup({
  id,
  label,
  options,
  value,
  onChange,
  columns = 3,
  className,
  error,
  maxSelection,
}: CheckboxGroupProps) {
  const handleChange = (optionValue: string, checked: boolean) => {
    if (checked) {
      // 최대 선택 제한 체크
      if (maxSelection && value.length >= maxSelection) {
        return; // 선택 불가
      }
      onChange([...value, optionValue]);
    } else {
      onChange(value.filter((v) => v !== optionValue));
    }
  };

  const isOptionDisabled = (optionValue: string) => {
    if (!maxSelection) return false;
    return !value.includes(optionValue) && value.length >= maxSelection;
  };

  return (
    <div className={cn('flex flex-col items-start gap-2', className)}>
      <div className="flex w-full items-center justify-between">
        <Label htmlFor={id}>{label}</Label>
        {maxSelection && (
          <span className="text-muted-foreground text-sm">
            {value.length}/{maxSelection} 선택됨
          </span>
        )}
      </div>
      <div className={cn('grid w-full gap-2', columnClasses[columns])}>
        {options.map((option) => {
          const disabled = isOptionDisabled(option.value);
          const checked = value.includes(option.value);
          return (
            <label
              key={option.value}
              className={cn(
                'flex cursor-pointer items-center gap-2 rounded-md border p-3 transition-colors',
                'border-input hover:bg-muted/50',
                'has-checked:border-primary has-checked:bg-primary/10',
                disabled && 'cursor-not-allowed opacity-50'
              )}
            >
              <input
                type="checkbox"
                value={option.value}
                checked={checked}
                disabled={disabled}
                onChange={(e) => handleChange(option.value, e.target.checked)}
                className="accent-primary size-4"
              />
              <span className="text-sm">{option.label}</span>
            </label>
          );
        })}
      </div>
      {error && <p className="text-destructive text-sm">{error}</p>}
    </div>
  );
}

export { CheckboxGroup };
export type { CheckboxGroupProps, CheckboxOption };

