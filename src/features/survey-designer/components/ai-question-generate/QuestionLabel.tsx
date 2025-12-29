import { Pencil } from 'lucide-react';

import { Button } from '@/components/ui/Button';
import { Label } from '@/components/ui/Label';

type QuestionLabelProps = {
  index: number;
  question: string;
  isSubmitting: boolean;
  isDisabled: boolean;
  onStartEdit: (e: React.MouseEvent) => void;
};

/**
 * 질문 라벨 (읽기 모드)
 * - 질문 텍스트 라벨 + 편집 버튼
 */
function QuestionLabel({
  index,
  question,
  isSubmitting,
  isDisabled,
  onStartEdit,
}: QuestionLabelProps) {
  return (
    <>
      <Label
        htmlFor={`question-${index}`}
        className="text-foreground flex-1 cursor-pointer text-start text-sm leading-relaxed font-normal"
        onClick={(e) => e.stopPropagation()}
      >
        {isSubmitting ? '질문 업데이트 중...' : question}
      </Label>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        onClick={onStartEdit}
        disabled={isDisabled}
        className="text-muted-foreground hover:text-foreground size-8"
        title="질문 수정"
      >
        <Pencil className="size-3.5" />
      </Button>
    </>
  );
}

export { QuestionLabel };
export type { QuestionLabelProps };
