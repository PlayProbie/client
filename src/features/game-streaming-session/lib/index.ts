/**
 * lib directory index
 */
export { cleanupMockStream, createMockMediaStream } from './mock-stream';
export {
  computeSegmentTiming,
  SegmentRecorder,
} from './segment-recorder/index';
export {
  createSegmentStore,
  type SegmentStore,
  type SegmentStoreBackend,
} from './segment-store/index';
export {
  createStreamClient,
  type StreamClient,
  type StreamClientConfig,
} from './stream-client';
