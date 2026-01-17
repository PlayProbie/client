import { useMemo } from 'react';

import type {
  Survey,
  SurveyStats,
} from '@/features/game-streaming-survey/types';

/**
 * 설문 통계 계산 훅
 */
export function useSurveyStats(surveys: Survey[] | undefined): SurveyStats {
  return useMemo(() => {
    if (!surveys || surveys.length === 0) {
      return {
        totalSurveys: 0,
        activeSurveys: 0,
        draftSurveys: 0,
        latestLabel: '등록된 설문이 없습니다.',
      };
    }

    const latestSurvey = surveys.reduce((latest, survey) =>
      new Date(survey.createdAt) > new Date(latest.createdAt) ? survey : latest
    );

    return {
      totalSurveys: surveys.length,
      activeSurveys: surveys.filter((survey) => survey.status === 'ACTIVE')
        .length,
      draftSurveys: surveys.filter((survey) => survey.status === 'DRAFT')
        .length,
      latestLabel: `${latestSurvey.surveyName} · ${new Date(
        latestSurvey.createdAt
      ).toLocaleDateString()}`,
    };
  }, [surveys]);
}
