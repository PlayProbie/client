/**
 * Game Streaming Survey Feature exports
 */

// Types
export type {
  CreateStreamingResourceRequest,
  StreamingResource,
  StreamingResourceStatus,
  Survey,
  SurveyStatus,
  SurveyStatusValue,
  UpdateSurveyStatusResponse,
} from './types';

// API
export {
  createStreamingResource,
  deleteStreamingResource,
  getStreamingResource,
  getSurveys,
  updateSurveyStatus,
} from './api';

// Hooks
export {
  streamingResourceKeys,
  surveyKeys,
  useCreateStreamingResource,
  useDeleteStreamingResource,
  useStreamingResource,
  useSurveys,
  useUpdateSurveyStatus,
} from './hooks';
