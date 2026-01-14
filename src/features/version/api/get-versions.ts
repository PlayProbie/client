import type { Version } from '../types';

// ----------------------------------------
// Mock Data
// ----------------------------------------

const MOCK_VERSIONS: Version[] = [
  {
    versionUuid: 'ver-001',
    gameUuid: 'game-001',
    versionName: 'v1.2.0-stable',
    description: 'Current Production Build',
    status: 'stable',
    createdAt: '2026-01-10T10:00:00Z',
    updatedAt: '2026-01-10T10:00:00Z',
  },
  {
    versionUuid: 'ver-002',
    gameUuid: 'game-001',
    versionName: 'v1.3.0-beta.1',
    description: 'Internal testing stage',
    status: 'beta',
    createdAt: '2026-01-12T10:00:00Z',
    updatedAt: '2026-01-12T10:00:00Z',
  },
  {
    versionUuid: 'ver-003',
    gameUuid: 'game-001',
    versionName: 'v1.1.9-legacy',
    description: 'Archived build',
    status: 'legacy',
    createdAt: '2026-01-05T10:00:00Z',
    updatedAt: '2026-01-05T10:00:00Z',
  },
];

// ----------------------------------------
// Mock API Functions
// ----------------------------------------

/**
 * 게임별 버전 목록 조회 (Mock)
 * TODO: 실제 API로 교체
 */
export async function getVersions(gameUuid: string): Promise<Version[]> {
  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 300));

  return MOCK_VERSIONS.filter((v) => v.gameUuid === gameUuid);
}

/**
 * 버전 상세 조회 (Mock)
 * TODO: 실제 API로 교체
 */
export async function getVersion(versionUuid: string): Promise<Version | null> {
  await new Promise((resolve) => setTimeout(resolve, 200));

  return MOCK_VERSIONS.find((v) => v.versionUuid === versionUuid) ?? null;
}
