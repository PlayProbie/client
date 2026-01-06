/**
 * MSW 핸들러 통합
 */

import { aiQuestionsHandlers } from './ai-questions';
import { fixedQuestionsHandlers } from './fixed-questions';
import { gameStreamingHandlers } from './game-streaming';
import { gameStreamingAdminHandlers } from './game-streaming-admin';
import { gameStreamingSurveyHandlers } from './game-streaming-survey';
import { gameStreamingTesterHandlers } from './game-streaming-tester';
import { gamesHandlers } from './games';
import { questionFeedbackHandlers } from './question-feedback';
import { surveyAnalyticsHandlers } from './survey-analytics';
import { surveyDesignHandlers } from './survey-design';
import { surveySessionHandlers } from './survey-session';
import { workspacesHandlers } from './workspaces';

export const handlers = [
  ...gamesHandlers,
  ...gameStreamingHandlers,
  ...gameStreamingAdminHandlers,
  ...gameStreamingSurveyHandlers,
  ...gameStreamingTesterHandlers,
  ...surveyDesignHandlers,
  ...fixedQuestionsHandlers,
  ...aiQuestionsHandlers,
  ...questionFeedbackHandlers,
  ...surveyAnalyticsHandlers,
  ...surveySessionHandlers,
  ...workspacesHandlers,
];
