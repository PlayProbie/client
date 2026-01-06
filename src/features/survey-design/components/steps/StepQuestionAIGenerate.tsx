import { Check, Plus } from 'lucide-react';

import { Button } from '@/components/ui';
import { Checkbox } from '@/components/ui/Checkbox';
import { cn } from '@/lib/utils';

import { useQuestionGenerate } from '../../hooks/useQuestionGenerate';
import { QuestionStatusBar } from '../ai-question-generate';

/**
 * Step 2: AI 질문 생성 (간소화)
 * - AI 생성 질문 목록 (피드백/대안 숨김)
 * - 질문 선택/해제 체크박스
 * - 선택 현황 상태 바
 */
function StepQuestionAIGenerate() {
  const {
    questions,
    selectedQuestions,
    loadingIndex,
    isGenerating,
    selectedCount,
    totalCount,
    isAllSelected,
    validationError,
    handleToggle,
    handleSelectAll,
    handleRegenerate,
    handleAddQuestion,
  } = useQuestionGenerate();

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col gap-1">
        <h3 className="text-foreground text-lg font-semibold">AI 질문 생성</h3>
        <p className="text-muted-foreground text-sm">
          AI가 생성한 질문을 확인하고, 설문에 포함할 질문을 선택하세요.
        </p>
      </div>

      {/* Status Bar */}
      <QuestionStatusBar
        selectedCount={selectedCount}
        totalCount={totalCount}
        isAllSelected={isAllSelected}
        isRegenerating={isGenerating}
        onSelectAll={handleSelectAll}
        onRegenerate={handleRegenerate}
      />

      {/* Add Question Button */}
      <Button
        type="button"
        variant="outline"
        onClick={handleAddQuestion}
        disabled={isGenerating}
        className="w-full gap-1.5"
      >
        <Plus className="size-4" />
        {isGenerating ? 'AI 질문 생성 중...' : 'AI 질문 추가 생성'}
      </Button>

      {/* Questions List (간소화 - 피드백/대안 없음) */}
      <div className="flex flex-col gap-3">
        {questions.map((question, index) => {
          const isSelected = selectedQuestions.has(index);
          const isLoading = loadingIndex === index;

          return (
            <button
              type="button"
              key={`${question}-${index}`}
              className={cn(
                'w-full text-left rounded-lg border p-4 transition-colors cursor-pointer',
                isSelected
                  ? 'border-primary/30 bg-primary/5'
                  : 'border-border bg-background hover:bg-muted/30',
                isLoading && 'opacity-70'
              )}
              onClick={() => !isLoading && handleToggle(index)}
            >
              <div className="flex items-start gap-3">
                <Checkbox
                  id={`question-${index}`}
                  checked={isSelected}
                  onCheckedChange={() => handleToggle(index)}
                  disabled={isLoading}
                  onClick={(e) => e.stopPropagation()}
                />
                <div className="flex-1">
                  <span className="text-sm font-medium text-muted-foreground mr-2">
                    Q{index + 1}.
                  </span>
                  <span className={cn(isSelected && 'text-primary font-medium')}>
                    {question}
                  </span>
                </div>
                {isSelected && (
                  <Check className="size-5 text-primary shrink-0" />
                )}
              </div>
            </button>
          );
        })}
      </div>

      {/* Validation Message */}
      {validationError && (
        <p className="text-destructive text-sm">{validationError}</p>
      )}
    </div>
  );
}

export { StepQuestionAIGenerate };
