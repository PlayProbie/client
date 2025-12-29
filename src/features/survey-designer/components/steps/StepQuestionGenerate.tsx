import { useQuestionGenerate } from '../../hooks/useQuestionGenerate';
import { QuestionList, QuestionStatusBar } from '../ai-question-generate';

/**
 * Step 2: 질문 생성
 * - AI 생성 질문 목록 (Accordion - 기본 펼침)
 * - 질문 선택/해제 체크박스
 * - AI 피드백 및 추천 대안
 * - 선택 현황 상태 바
 * - 다시 생성하기 버튼
 */
function StepQuestionGenerate() {
  const {
    questions,
    feedbackMap,
    selectedQuestions,
    loadingIndex,
    isFetchingFeedback,
    selectedCount,
    totalCount,
    isAllSelected,
    validationError,
    handleToggle,
    handleSelectAll,
    handleRegenerate,
    handleRequestFeedback,
    handleSuggestionClick,
  } = useQuestionGenerate();

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col gap-1">
        <h3 className="text-foreground text-lg font-semibold">질문 생성</h3>
        <p className="text-muted-foreground text-sm">
          AI가 생성한 질문을 확인하고, 설문에 포함할 질문을 선택하세요. 질문을
          수정하거나 추천 대안을 클릭하여 변경할 수 있습니다.
        </p>
      </div>

      {/* Questions List */}
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

      {/* Status Bar */}
      <QuestionStatusBar
        selectedCount={selectedCount}
        totalCount={totalCount}
        isAllSelected={isAllSelected}
        onSelectAll={handleSelectAll}
        onRegenerate={handleRegenerate}
      />

      {/* Validation Message (react-hook-form 연동) */}
      {validationError && (
        <p className="text-destructive text-sm">{validationError}</p>
      )}
    </div>
  );
}

export { StepQuestionGenerate };
