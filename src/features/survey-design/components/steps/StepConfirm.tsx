import { getThemeDetailOptions, THEME_CATEGORY_OPTIONS } from '@/constants';
import { GameGenreConfig } from '@/features/game';

import { useSurveyFormStore } from '../../store/useSurveyFormStore';
import { TestStageConfig, type ThemeCategory } from '../../types';

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
    startedAt,
    endedAt,
    questions,
    selectedQuestionIndices,
    // 신규 필드
    testStage,
    themePriorities,
    themeDetails,
    versionNote,
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

  // 테스트 단계 라벨 변환
  const stageLabel =
    Object.values(TestStageConfig).find((c) => c.value === testStage)?.label ||
    '-';

  // 테마 대분류 라벨 가져오기
  const getCategoryLabel = (category: ThemeCategory) =>
    THEME_CATEGORY_OPTIONS.find((o) => o.value === category)?.label || category;

  // 테마 소분류 라벨 가져오기
  const getDetailLabel = (category: ThemeCategory, detail: string) =>
    getThemeDetailOptions(category).find((o) => o.value === detail)?.label ||
    detail;

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
        <h4 className="pb-3 text-lg font-bold">게임 정보</h4>
        <dl className="grid grid-cols-[120px_1fr] gap-x-4 gap-y-3 text-sm">
          <dt className="text-muted-foreground">게임 이름</dt>
          <dd className="font-medium">{gameName || '-'}</dd>

          <dt className="text-muted-foreground">게임 장르</dt>
          <dd className="font-medium">{genreLabels || '-'}</dd>
        </dl>
        {gameContext && (
          <div className="space-y-2">
            <p className="text-muted-foreground w-[120px] text-center text-sm">
              게임 설명
            </p>
            <p className="bg-muted mx-8 rounded-lg p-3 text-start text-sm leading-relaxed whitespace-pre-wrap">
              {gameContext}
            </p>
          </div>
        )}
      </section>

      {/* 설문 정보 */}
      <section className="bg-surface border-border space-y-4 rounded-xl border p-5 shadow-sm">
        <h4 className="pb-3 text-lg font-bold">설문 정보</h4>
        <dl className="grid grid-cols-[120px_1fr] gap-x-4 gap-y-3 text-sm">
          <dt className="text-muted-foreground">설문 이름</dt>
          <dd className="font-medium">{surveyName || '-'}</dd>

          <dt className="text-muted-foreground">테스트 단계</dt>
          <dd className="font-medium">{stageLabel}</dd>

          <dt className="text-muted-foreground">기간</dt>
          <dd className="font-medium">
            {startedAt || '-'} ~ {endedAt || '-'}
          </dd>

          {versionNote && (
            <>
              <dt className="text-muted-foreground">버전 메모</dt>
              <dd className="font-medium">{versionNote}</dd>
            </>
          )}
        </dl>
      </section>

      {/* 테스트 목적 (테마 우선순위) */}
      {themePriorities && themePriorities.length > 0 && (
        <section className="bg-surface border-border space-y-4 rounded-xl border p-5 shadow-sm">
          <h4 className="pb-3 text-lg font-bold">테스트 목적</h4>
          <div className="space-y-3">
            {themePriorities.map((category, index) => {
              const details =
                (themeDetails as Record<ThemeCategory, string[]>)?.[category] ||
                [];
              return (
                <div
                  key={category}
                  className="flex items-start gap-3"
                >
                  <span className="bg-primary text-primary-foreground flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold">
                    {index + 1}
                  </span>
                  <div>
                    <span className="font-medium">
                      {getCategoryLabel(category)}
                    </span>
                    {details.length > 0 && (
                      <p className="text-muted-foreground mt-1 text-sm">
                        {details
                          .map((d) => getDetailLabel(category, d))
                          .join(', ')}
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* 선택된 질문 */}
      {selectedQuestions.length > 0 && (
        <section className="bg-surface border-border space-y-4 rounded-xl border p-5 shadow-sm">
          <h4 className="pb-3 text-lg font-bold">
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

