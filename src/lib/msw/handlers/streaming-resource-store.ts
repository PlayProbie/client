import {
  type ApiStreamingResource,
  StreamingResourceStatus,
} from '@/features/game-streaming-survey/types';

export type MockStreamingResource = ApiStreamingResource & {
  instances_ready?: boolean;
};

export const MOCK_STREAMING_RESOURCES: Record<
  string,
  MockStreamingResource
> = {
  'survey-002-uuid': {
    uuid: 'resource-001-uuid',
    status: StreamingResourceStatus.READY,
    current_capacity: 0,
    max_capacity: 10,
    instance_type: 'g4dn.xlarge',
    created_at: '2025-12-18T14:30:00Z',
  },
};
