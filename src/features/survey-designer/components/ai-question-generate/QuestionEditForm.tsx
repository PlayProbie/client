import { Check, X } from 'lucide-react';

import { Button } from '@/components/ui/Button';
import { Textarea } from '@/components/ui/Textarea';

type QuestionEditFormProps = {
  editedQuestion: string;
  isSubmitting: boolean;
  onChangeQuestion: (value: string) => void;
  onSubmit: (e: React.MouseEvent) => void;
  onCancel: (e: React.MouseEvent) => void;
};

/**
 * 질문 편집 폼 (수정 모드)
 * - Textarea + 확인/취소 버튼
 */
function QuestionEditForm({
  editedQuestion,
  isSubmitting,
  onChangeQuestion,
  onSubmit,
  onCancel,
}: QuestionEditFormProps) {
  return (
    <div
      role="presentation"
      className="flex flex-1 items-start gap-2"
      onClick={(e) => e.stopPropagation()}
    >
      <Textarea
        value={editedQuestion}
        onChange={(e) => onChangeQuestion(e.target.value)}
        placeholder="질문을 입력하세요"
        disabled={isSubmitting}
        className="min-h-[60px] flex-1 resize-none text-sm"
        // eslint-disable-next-line jsx-a11y/no-autofocus
        autoFocus // 의도된 접근성
      />
      <div className="flex flex-col gap-1">
        <Button
          type="button"
          variant="default"
          size="icon"
          onClick={onSubmit}
          disabled={isSubmitting || !editedQuestion.trim()}
          className="size-8"
          title="질문 수정"
        >
          <Check className="size-4" />
        </Button>
        <Button
          type="button"
          variant="outline"
          size="icon"
          onClick={onCancel}
          disabled={isSubmitting}
          className="size-8"
          title="취소"
        >
          <X className="size-4" />
        </Button>
      </div>
    </div>
  );
}

export { QuestionEditForm };
export type { QuestionEditFormProps };
