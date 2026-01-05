/**
 * MSW 핸들러 통합
 */

import { aiQuestionsHandlers } from './ai-questions';
import { fixedQuestionsHandlers } from './fixed-questions';
import { gameStreamingHandlers } from './game-streaming';
import { gameStreamingSurveyHandlers } from './game-streaming-survey';
import { gamesHandlers } from './games';
import { questionFeedbackHandlers } from './question-feedback';
import { surveyAnalyticsHandlers } from './survey-analytics';
import { surveyDesignHandlers } from './survey-design';
import { surveySessionHandlers } from './survey-session';

export const handlers = [
  ...gamesHandlers,
  ...gameStreamingHandlers,
  ...gameStreamingSurveyHandlers,
  ...surveyDesignHandlers,
  ...fixedQuestionsHandlers,
  ...aiQuestionsHandlers,
  ...questionFeedbackHandlers,
  ...surveyAnalyticsHandlers,
  ...surveySessionHandlers,
];
