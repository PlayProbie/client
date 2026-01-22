/**
 * Game Streaming Session Feature
 *
 * Phase 4-5: Tester 스트리밍 API
 */

export { getSession, getSessionStatus, postSignal, postTerminate } from './api';
export * from './components';
export {
  sessionKeys,
  useGameStream,
  useInputLogger,
  useSegmentRecorder,
  useSessionInfo,
  useSessionStatus,
  useSessionTimer,
  useSignal,
  useTerminateSession,
} from './hooks';
export {
  computeSegmentTiming,
  createSegmentStore,
  createStreamClient,
  SegmentRecorder,
  type SegmentStore,
  type SegmentStoreBackend,
  type StreamClient,
  type StreamClientConfig,
} from './lib';
export type {
  SessionInfo,
  SessionStatus,
  SignalRequest,
  SignalResponse,
  StreamSettingsInfo,
  TerminateReason,
  TerminateRequest,
  TerminateResponse,
} from './types';
