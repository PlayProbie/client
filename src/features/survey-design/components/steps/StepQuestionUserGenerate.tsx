import { Button } from '@/components/ui';
import { Input } from '@/components/ui/Input';

import { useQuestionUserGenerate } from '../../hooks/useQuestionUserGenerate';
import { QuestionList, QuestionStatusBar } from '../ai-question-generate';

/**
 * Step 2: 유저 질문 생성
 * - 유저가 직접 질문 입력
 * - 피드백 받기 버튼으로 AI 피드백 요청
 * - 질문 선택/해제 체크박스
 * - AI 피드백 및 추천 대안
 * - 선택 현황 상태 바
 */
function StepQuestionUserGenerate() {
  const {
    questions,
    feedbackMap,
    selectedQuestions,
    loadingIndex,
    isFetchingFeedback,
    newQuestion,
    setNewQuestion,
    selectedCount,
    totalCount,
    isAllSelected,
    validationError,
    handleToggle,
    handleSelectAll,
    handleAddQuestion,
    handleRequestFeedback,
    handleSuggestionClick,
  } = useQuestionUserGenerate();

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.nativeEvent.isComposing) {
      e.preventDefault();
      handleAddQuestion();
    }
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col gap-1">
        <h3 className="text-foreground text-lg font-semibold">
          유저 질문 생성
        </h3>
        <p className="text-muted-foreground text-sm">
          설문에 포함할 질문을 직접 입력하세요. 질문을 추가하면 AI가 피드백과
          추천 대안을 제공합니다.
        </p>
      </div>

      {/* New Question Input */}
      <div className="flex gap-2">
        <Input
          type="text"
          placeholder="질문을 입력하세요..."
          value={newQuestion}
          onChange={(e) => setNewQuestion(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={isFetchingFeedback}
          className="flex-1"
        />
        <Button
          type="button"
          onClick={handleAddQuestion}
          disabled={!newQuestion.trim() || isFetchingFeedback}
        >
          {isFetchingFeedback ? '추가 중...' : '피드백 받기'}
        </Button>
      </div>

      {/* Questions List */}
      {questions.length > 0 && (
        <QuestionList
          questions={questions}
          selectedQuestions={selectedQuestions}
          loadingIndex={loadingIndex}
          isFetchingFeedback={isFetchingFeedback}
          feedbackMap={feedbackMap}
          onToggle={handleToggle}
          onSuggestionClick={handleSuggestionClick}
          onRequestFeedback={handleRequestFeedback}
        />
      )}

      {/* Status Bar */}
      {questions.length > 0 && (
        <QuestionStatusBar
          selectedCount={selectedCount}
          totalCount={totalCount}
          isAllSelected={isAllSelected}
          onSelectAll={handleSelectAll}
        />
      )}

      {/* Validation Message (react-hook-form 연동) */}
      {validationError && (
        <p className="text-destructive text-sm">{validationError}</p>
      )}
    </div>
  );
}

export { StepQuestionUserGenerate };
