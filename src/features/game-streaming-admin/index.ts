/**
 * Game Streaming Admin Feature exports
 *
 * Phase 3: 관리자 테스트 (0 ↔ 1)
 */

// Types
export type { AdminTestResult, ResourceStatus } from './types';

// API
export { getResourceStatus, startTest, stopTest } from './api';

// Hooks
export {
  adminTestKeys,
  useResourceStatus,
  useStartTest,
  useStopTest,
} from './hooks';
