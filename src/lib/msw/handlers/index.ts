/**
 * MSW 핸들러 통합
 */

import { aiQuestionsHandlers } from './ai-questions';
import { fixedQuestionsHandlers } from './fixed-questions';
import { gamesHandlers } from './games';
import { questionFeedbackHandlers } from './question-feedback';
import { surveyCreateHandlers } from './survey-create';
import { surveyResponseHandlers } from './survey-response';
import { surveyRunnerHandlers } from './survey-runner';

export const handlers = [
  ...gamesHandlers,
  ...surveyCreateHandlers,
  ...fixedQuestionsHandlers,
  ...aiQuestionsHandlers,
  ...questionFeedbackHandlers,
  ...surveyResponseHandlers,
  ...surveyRunnerHandlers,
];
