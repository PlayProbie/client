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
} from './types';

// API
export {
  createStreamingResource,
  deleteStreamingResource,
  getStreamingResource,
  getSurveys,
} from './api';

// Hooks
export {
  streamingResourceKeys,
  surveyKeys,
  useCreateStreamingResource,
  useDeleteStreamingResource,
  useStreamingResource,
  useSurveys,
} from './hooks';
