/**
 * MSW 핸들러 통합
 */

import { aiQuestionsHandlers } from './ai-questions';
import { authHandlers } from './auth';
import { fixedQuestionsHandlers } from './fixed-questions';
import { gameStreamingHandlers } from './game-streaming';
import { gameStreamingAdminHandlers } from './game-streaming-admin';
import { gameStreamingSessionHandlers } from './game-streaming-session';
import { gameStreamingSurveyHandlers } from './game-streaming-survey';
import { gamesHandlers } from './games';
import { questionFeedbackHandlers } from './question-feedback';
import { surveyAnalyticsHandlers } from './survey-analytics';
import { surveyDesignHandlers } from './survey-design';
import { surveySessionHandlers } from './survey-session';
import { workspacesHandlers } from './workspaces';

export const handlers = [
  ...authHandlers,
  ...gamesHandlers,
  ...gameStreamingHandlers,
  ...gameStreamingAdminHandlers,
  ...gameStreamingSurveyHandlers,
  ...gameStreamingSessionHandlers,
  ...surveyDesignHandlers,
  ...fixedQuestionsHandlers,
  ...aiQuestionsHandlers,
  ...questionFeedbackHandlers,
  ...surveyAnalyticsHandlers,
  ...surveySessionHandlers,
  ...workspacesHandlers,
];
