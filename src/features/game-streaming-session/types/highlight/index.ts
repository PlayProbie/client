/**
 * Virtual Highlight 시스템 타입 정의
 *
 * Phase 0: 입력 로그/세그먼트/InsightTag 스키마 정의
 *
 * 명명 규칙:
 * - API 응답/요청 타입: snake_case (Api prefix)
 * - 클라이언트 상태 타입: camelCase
 */
export * from './input-logs';
export * from './insight-tags';
export * from './segments';
export * from './transformers';
export * from './upload';
