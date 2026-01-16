/**
 * lib directory index
 */
export { SegmentRecorder } from './recorder/segment-recorder';
export { computeSegmentTiming } from './recorder/segment-recorder.timing';
export { createSegmentStore } from './store/segment-store';
export type {
  SegmentStore,
  SegmentStoreBackend,
  SegmentWriter,
} from './store/segment-store.types';
export { cleanupMockStream, createMockMediaStream } from './stream/mock-stream';
export {
  createStreamClient,
  type StreamClient,
  type StreamClientConfig,
} from './stream/stream-client';
