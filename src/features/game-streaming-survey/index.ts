/**
 * Game Streaming Survey Feature exports
 */

// Types
export type {
  CreateStreamingResourceRequest,
  StreamingResource,
  Survey,
  SurveyStatus,
  SurveyStatusValue,
  UpdateSurveyStatusResponse,
} from './types';
export { StreamingResourceStatus } from './types';

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
  useProvisioningPolling,
  useStreamingResource,
  useSurveys,
  useUpdateSurveyStatus,
} from './hooks';
