/**
 * MSW 핸들러 통합
 */

import { aiQuestionsHandlers } from './ai-questions';
import { fixedQuestionsHandlers } from './fixed-questions';
import { gamesHandlers } from './games';
import { questionFeedbackHandlers } from './question-feedback';
import { surveyAnalyticsHandlers } from './survey-analytics';
import { surveyCreateHandlers } from './survey-create';
import { surveySessionHandlers } from './survey-session';

export const handlers = [
  ...gamesHandlers,
  ...surveyCreateHandlers,
  ...fixedQuestionsHandlers,
  ...aiQuestionsHandlers,
  ...questionFeedbackHandlers,
  ...surveyAnalyticsHandlers,
  ...surveySessionHandlers,
];
