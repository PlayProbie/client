/**
 * MSW 핸들러 통합
 */

import { aiQuestionsHandlers } from './ai-questions';
import { fixedQuestionsHandlers } from './fixed-questions';
import { gamesHandlers } from './games';
import { questionFeedbackHandlers } from './question-feedback';
import { surveyAnalyticsHandlers } from './survey-analytics';
import { surveyDesignHandlers } from './survey-design';
import { surveySessionHandlers } from './survey-session';

export const handlers = [
  ...gamesHandlers,
  ...surveyDesignHandlers,
  ...fixedQuestionsHandlers,
  ...aiQuestionsHandlers,
  ...questionFeedbackHandlers,
  ...surveyAnalyticsHandlers,
  ...surveySessionHandlers,
];
