/**
 * Game Streaming Session Feature
 *
 * Phase 4-5: Tester 스트리밍 API
 */

// Types
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

// Lib
export type { StreamClient, StreamClientConfig } from './lib';
export { createStreamClient } from './lib';

// API
export { getSession, getSessionStatus, postSignal, postTerminate } from './api';

// Components
export * from './components';

// Hooks
export {
  sessionKeys,
  useFullscreen,
  useGameStream,
  useInputLogger,
  useSessionInfo,
  useSessionStatus,
  useSessionTimer,
  useSignal,
  useTerminateSession,
} from './hooks';
