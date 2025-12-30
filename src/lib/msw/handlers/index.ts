/**
 * MSW 핸들러 통합
 */

import { aiQuestionsHandlers } from './ai-questions';
import { fixedQuestionsHandlers } from './fixed-questions';
import { gamesHandlers } from './games';
import { questionFeedbackHandlers } from './question-feedback';
import { surveyResponseHandlers } from './survey-response';
import { surveysHandlers } from './surveys';

export const handlers = [
  ...gamesHandlers,
  ...surveysHandlers,
  ...fixedQuestionsHandlers,
  ...aiQuestionsHandlers,
  ...questionFeedbackHandlers,
  ...surveyResponseHandlers,
];
