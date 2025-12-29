import type { Control } from 'react-hook-form';
import { useWatch } from 'react-hook-form';

import { GameGenreConfig } from '@/features/game';

import type { SurveyFormData } from '../../types';
import { TestPurposeConfig } from '../../types';

type StepConfirmProps = {
  control: Control<SurveyFormData>;
};

/**
 * Step 3: 최종 확인
 */
function StepConfirm({ control }: StepConfirmProps) {
  const gameGenres = useWatch({ control, name: 'gameGenre' }) || [];
  const genreLabels = gameGenres
    .map((genre) => {
      const config = Object.values(GameGenreConfig).find(
        (c) => c.value === genre
      );
      return config?.label;
    })
    .filter(Boolean)
    .join(', ');

  const testPurpose = useWatch({ control, name: 'testPurpose' });
  const purposeLabel =
    Object.values(TestPurposeConfig).find((c) => c.value === testPurpose)
      ?.label || '-';

  const gameName = useWatch({ control, name: 'gameName' });
  const surveyName = useWatch({ control, name: 'surveyName' });
  const startedAt = useWatch({ control, name: 'startedAt' });
  const endedAt = useWatch({ control, name: 'endedAt' });

  return (
    <div className="flex flex-col gap-4">
      <h3 className="text-lg font-semibold">입력 내용 확인</h3>
      <div className="border-border bg-muted/50 rounded-lg border p-4">
        <dl className="flex flex-col gap-3">
          <div className="flex justify-between">
            <dt className="text-muted-foreground text-left">게임 이름</dt>
            <dd className="font-medium">{gameName || '-'}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-muted-foreground text-left">게임 장르</dt>
            <dd className="font-medium">{genreLabels || '-'}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-muted-foreground text-left">설문 이름</dt>
            <dd className="font-medium">{surveyName || '-'}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-muted-foreground text-left">테스트 목적</dt>
            <dd className="font-medium">{purposeLabel}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-muted-foreground text-left">기간</dt>
            <dd className="font-medium">
              {startedAt || '-'} ~ {endedAt || '-'}
            </dd>
          </div>
        </dl>
      </div>
    </div>
  );
}

export { StepConfirm };
