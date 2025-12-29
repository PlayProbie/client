import { GameGenreConfig } from '@/features/game';

import { useSurveyFormStore } from '../../store/useSurveyFormStore';
import { TestPurposeConfig } from '../../types';

/**
 * Step 3: 최종 확인
 * useSurveyFormStore에서 데이터를 가져와 표시
 */
function StepConfirm() {
  const { formData } = useSurveyFormStore();

  const {
    gameName,
    gameGenre,
    gameContext,
    surveyName,
    testPurpose,
    startedAt,
    endedAt,
    questions,
    selectedQuestionIndices,
  } = formData;

  // 게임 장르 라벨 변환
  const genreLabels = (gameGenre || [])
    .map((genre) => {
      const config = Object.values(GameGenreConfig).find(
        (c) => c.value === genre
      );
      return config?.label;
    })
    .filter(Boolean)
    .join(', ');

  // 테스트 목적 라벨 변환
  const purposeLabel =
    Object.values(TestPurposeConfig).find((c) => c.value === testPurpose)
      ?.label || '-';

  // 선택된 질문 목록
  const selectedQuestions = (selectedQuestionIndices || [])
    .map((index) => questions?.[index])
    .filter(Boolean);

  return (
    <div className="flex flex-col gap-6">
      <div className="space-y-1">
        <h3 className="text-xl font-semibold">입력 내용 확인</h3>
        <p className="text-muted-foreground text-sm">
          설문 생성 전 입력 내용을 확인해 주세요.
        </p>
      </div>

      {/* 게임 정보 */}
      <section className="bg-surface border-border space-y-4 rounded-xl border p-5 shadow-sm">
        <h4 className="text-sm font-semibold">게임 정보</h4>
        <dl className="grid grid-cols-[120px_1fr] gap-x-4 gap-y-3 text-sm">
          <dt className="text-muted-foreground">게임 이름</dt>
          <dd className="font-medium">{gameName || '-'}</dd>

          <dt className="text-muted-foreground">게임 장르</dt>
          <dd className="font-medium">{genreLabels || '-'}</dd>
        </dl>
        {gameContext && (
          <div className="space-y-2">
            <p className="text-muted-foreground text-sm">게임 설명</p>
            <p className="bg-muted rounded-lg p-3 text-start text-sm leading-relaxed">
              {gameContext}
            </p>
          </div>
        )}
      </section>

      {/* 설문 정보 */}
      <section className="bg-surface border-border space-y-4 rounded-xl border p-5 shadow-sm">
        <h4 className="text-sm font-semibold">설문 정보</h4>
        <dl className="grid grid-cols-[120px_1fr] gap-x-4 gap-y-3 text-sm">
          <dt className="text-muted-foreground">설문 이름</dt>
          <dd className="font-medium">{surveyName || '-'}</dd>

          <dt className="text-muted-foreground">테스트 목적</dt>
          <dd className="font-medium">{purposeLabel}</dd>

          <dt className="text-muted-foreground">기간</dt>
          <dd className="font-medium">
            {startedAt || '-'} ~ {endedAt || '-'}
          </dd>
        </dl>
      </section>

      {/* 선택된 질문 */}
      {selectedQuestions.length > 0 && (
        <section className="bg-surface border-border space-y-4 rounded-xl border p-5 shadow-sm">
          <h4 className="text-sm font-semibold">
            선택된 질문{' '}
            <span className="text-primary">({selectedQuestions.length}개)</span>
          </h4>
          <ol className="space-y-2">
            {selectedQuestions.map((question, index) => (
              <li
                key={index}
                className="bg-muted flex gap-3 rounded-lg px-4 py-3 text-sm"
              >
                <span className="text-primary font-semibold">{index + 1}.</span>
                <span className="leading-relaxed">{question}</span>
              </li>
            ))}
          </ol>
        </section>
      )}
    </div>
  );
}

export { StepConfirm };
