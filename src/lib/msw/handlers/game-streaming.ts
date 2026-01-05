/**
 * Game Streaming MSW Handlers
 * Mock API handlers for game streaming features
 */
import { delay, http, HttpResponse } from 'msw';

import type {
  ApiBuild,
  ApiBuildCompleteResponse,
  ApiCreateBuildResponse,
  ApiSourceGame,
  ApiStreamingGame,
  ApiStreamSettings,
} from '@/features/game-streaming/types';

const API_BASE_URL = '/api';

// ----------------------------------------
// Mock Data: Source Games (Survey 시스템)
// ----------------------------------------
const SOURCE_GAMES: ApiSourceGame[] = [
  {
    game_id: 1,
    game_name: 'Dark Souls Clone',
    game_genre: ['rpg', 'casual'],
    created_at: '2025-12-15T10:00:00Z',
    is_streaming: true,
  },
  {
    game_id: 2,
    game_name: 'Racing Simulator Pro',
    game_genre: ['simulation', 'sports'],
    created_at: '2025-12-16T11:00:00Z',
    is_streaming: true,
  },
  {
    game_id: 3,
    game_name: 'Puzzle Adventure',
    game_genre: ['casual'],
    created_at: '2025-12-17T09:00:00Z',
    is_streaming: false,
  },
  {
    game_id: 4,
    game_name: 'Space Shooter X',
    game_genre: ['shooter'],
    created_at: '2025-12-18T14:00:00Z',
    is_streaming: false,
  },
  {
    game_id: 5,
    game_name: 'Fantasy Kingdom',
    game_genre: ['rpg', 'strategy'],
    created_at: '2025-12-19T16:00:00Z',
    is_streaming: false,
  },
];

// ----------------------------------------
// Mock Data: Streaming Games
// ----------------------------------------
const STREAMING_GAMES: ApiStreamingGame[] = [
  {
    game_uuid: 'game-001-uuid-abcd',
    game_id: 1,
    game_name: 'Dark Souls Clone',
    builds_count: 3,
    updated_at: '2025-12-20T10:30:00Z',
  },
  {
    game_uuid: 'game-002-uuid-efgh',
    game_id: 2,
    game_name: 'Racing Simulator Pro',
    builds_count: 1,
    updated_at: '2025-12-18T15:45:00Z',
  },
];

const MOCK_BUILDS: Record<string, ApiBuild[]> = {
  'game-001-uuid-abcd': [
    {
      build_id: 'build-001',
      filename: 'dark-souls-v1.0.0.zip',
      status: 'READY',
      size: 2_500_000_000,
      s3_key: 'builds/game-001/dark-souls-v1.0.0.zip',
      executable_path: '/Game/Binaries/Win64/DarkSouls.exe',
      version: '1.0.0',
      note: 'Initial release',
      created_at: '2025-12-20T10:00:00Z',
      updated_at: '2025-12-20T10:30:00Z',
    },
    {
      build_id: 'build-002',
      filename: 'dark-souls-v1.1.0.zip',
      status: 'UPLOADED',
      size: 2_600_000_000,
      s3_key: 'builds/game-001/dark-souls-v1.1.0.zip',
      executable_path: '/Game/Binaries/Win64/DarkSouls.exe',
      version: '1.1.0',
      created_at: '2025-12-21T14:00:00Z',
      updated_at: '2025-12-21T14:05:00Z',
    },
  ],
  'game-002-uuid-efgh': [
    {
      build_id: 'build-004',
      filename: 'racing-sim-v2.0.0.zip',
      status: 'READY',
      size: 4_000_000_000,
      s3_key: 'builds/game-002/racing-sim-v2.0.0.zip',
      executable_path: '/RacingSim/Binaries/Win64/RacingSim.exe',
      version: '2.0.0',
      created_at: '2025-12-18T15:00:00Z',
      updated_at: '2025-12-18T15:45:00Z',
    },
  ],
};

let buildCounter = 100;
let gameCounter = 100;

// ----------------------------------------
// Mock Data: Stream Settings
// ----------------------------------------
const MOCK_STREAM_SETTINGS: Record<string, ApiStreamSettings> = {
  'game-001-uuid-abcd': {
    gpu_profile: 'performance',
    resolution_fps: '1080p60',
    os: 'Windows Server 2022',
    region: 'ap-northeast-1',
    max_sessions: 10,
  },
  'game-002-uuid-efgh': {
    gpu_profile: 'entry',
    resolution_fps: '720p30',
    os: 'Windows Server 2022',
    region: 'ap-northeast-1',
    max_sessions: 5,
  },
};

export const gameStreamingHandlers = [
  // ----------------------------------------
  // Source Games API (Survey 시스템)
  // ----------------------------------------
  http.get(`${API_BASE_URL}/source-games`, async () => {
    await delay(300);
    return HttpResponse.json(SOURCE_GAMES);
  }),

  // ----------------------------------------
  // Streaming Games API
  // ----------------------------------------

  // 스트리밍 게임 목록
  http.get(`${API_BASE_URL}/streaming-games`, async () => {
    await delay(300);
    return HttpResponse.json(STREAMING_GAMES);
  }),

  // 스트리밍 게임 등록
  http.post(`${API_BASE_URL}/streaming-games`, async ({ request }) => {
    await delay(300);
    const body = (await request.json()) as { game_id: number };

    // Source Game 찾기
    const sourceGame = SOURCE_GAMES.find((g) => g.game_id === body.game_id);
    if (!sourceGame) {
      return HttpResponse.json(
        { message: 'Source Game not found' },
        { status: 404 }
      );
    }

    // 이미 등록된 경우
    if (sourceGame.is_streaming) {
      return HttpResponse.json(
        { message: 'Game is already registered for streaming' },
        { status: 400 }
      );
    }

    gameCounter++;
    const newStreamingGame: ApiStreamingGame = {
      game_uuid: `game-${gameCounter}-uuid-${Date.now()}`,
      game_id: body.game_id,
      game_name: sourceGame.game_name,
      builds_count: 0,
      updated_at: new Date().toISOString(),
    };

    STREAMING_GAMES.push(newStreamingGame);
    sourceGame.is_streaming = true;

    return HttpResponse.json(newStreamingGame, { status: 201 });
  }),

  // 스트리밍 게임 등록 해제
  http.delete(
    `${API_BASE_URL}/streaming-games/:gameUuid`,
    async ({ params }) => {
      await delay(300);
      const { gameUuid } = params;

      const gameIndex = STREAMING_GAMES.findIndex(
        (g) => g.game_uuid === gameUuid
      );
      if (gameIndex === -1) {
        return HttpResponse.json(
          { message: 'Streaming Game not found' },
          { status: 404 }
        );
      }

      const game = STREAMING_GAMES[gameIndex];

      // Source Game의 is_streaming 업데이트
      const sourceGame = SOURCE_GAMES.find((g) => g.game_id === game.game_id);
      if (sourceGame) {
        sourceGame.is_streaming = false;
      }

      STREAMING_GAMES.splice(gameIndex, 1);
      delete MOCK_BUILDS[gameUuid as string];

      return HttpResponse.json({ success: true });
    }
  ),

  // ----------------------------------------
  // Legacy Games API (backward compatibility)
  // ----------------------------------------
  http.get(`${API_BASE_URL}/games`, async () => {
    await delay(300);
    // Legacy: game_id 없이 응답
    return HttpResponse.json(
      STREAMING_GAMES.map((g) => ({
        game_uuid: g.game_uuid,
        game_name: g.game_name,
        builds_count: g.builds_count,
        updated_at: g.updated_at,
      }))
    );
  }),

  // ----------------------------------------
  // Builds API
  // ----------------------------------------
  http.get(
    `${API_BASE_URL}/streaming-games/:gameUuid/builds`,
    async ({ params }) => {
      await delay(300);
      const { gameUuid } = params;
      const builds = MOCK_BUILDS[gameUuid as string] || [];
      return HttpResponse.json(builds);
    }
  ),

  // Legacy builds endpoint
  http.get(`${API_BASE_URL}/games/:gameUuid/builds`, async ({ params }) => {
    await delay(300);
    const { gameUuid } = params;
    const builds = MOCK_BUILDS[gameUuid as string] || [];
    return HttpResponse.json(builds);
  }),

  // 빌드 생성 및 STS Credentials 발급 (Spring GameBuildApi.createBuild)
  http.post(
    `${API_BASE_URL}/games/:gameUuid/builds`,
    async ({ params, request }) => {
      await delay(500);
      const { gameUuid } = params;
      const body = (await request.json()) as { version: string };

      buildCounter++;
      const buildId = `build-${buildCounter}-${crypto.randomUUID().slice(0, 8)}`;
      const s3Prefix = `builds/${gameUuid}/${buildId}`;

      const response: ApiCreateBuildResponse = {
        buildId,
        version: body.version,
        s3Prefix,
        credentials: {
          accessKeyId: 'AKIAIOSFODNN7EXAMPLE',
          secretAccessKey: 'wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY',
          sessionToken: 'FwoGZXIvYXdzEBYaDMockSessionToken==',
          expiration: Date.now() + 3600000, // epoch timestamp
        },
      };

      return HttpResponse.json(response, { status: 201 });
    }
  ),

  // Build Complete (Spring GameBuildApi.completeUpload)
  http.post(
    `${API_BASE_URL}/games/:gameUuid/builds/:buildId/complete`,
    async ({ params, request }) => {
      await delay(300);
      const { gameUuid, buildId } = params;
      const body = (await request.json()) as {
        expectedFileCount: number;
        expectedTotalSize: number;
      };

      // MOCK_BUILDS에 빌드 추가
      const newBuild: ApiBuild = {
        build_id: buildId as string,
        filename: `build-${buildId}`,
        status: 'UPLOADED',
        size: body.expectedTotalSize,
        s3_key: `builds/${gameUuid}/${buildId}`,
        executable_path: '/Game/MyGame.exe',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      if (!MOCK_BUILDS[gameUuid as string]) {
        MOCK_BUILDS[gameUuid as string] = [];
      }
      MOCK_BUILDS[gameUuid as string].push(newBuild);

      const response: ApiBuildCompleteResponse = {
        id: buildId as string,
        gameUuid: gameUuid as string,
        version: '1.0.0',
        s3Prefix: `builds/${gameUuid}/${buildId}`,
        status: 'UPLOADED',
        totalFiles: body.expectedFileCount,
        totalSize: body.expectedTotalSize,
        createdAt: new Date().toISOString(),
      };

      return HttpResponse.json(response);
    }
  ),

  // Build Delete (Spring GameBuildApi.deleteBuild)
  http.delete(
    `${API_BASE_URL}/games/:gameUuid/builds/:buildId`,
    async ({ params }) => {
      await delay(300);
      const { gameUuid, buildId } = params;

      const builds = MOCK_BUILDS[gameUuid as string];
      if (builds) {
        const index = builds.findIndex((b) => b.build_id === buildId);
        if (index !== -1) {
          builds.splice(index, 1);
        }
      }

      return new HttpResponse(null, { status: 204 });
    }
  ),

  // ----------------------------------------
  // Stream Settings API
  // ----------------------------------------
  http.get(
    `${API_BASE_URL}/streaming-games/:gameUuid/stream-settings`,
    async ({ params }) => {
      await delay(300);
      const { gameUuid } = params;

      const settings = MOCK_STREAM_SETTINGS[gameUuid as string] || {
        gpu_profile: 'entry',
        resolution_fps: '720p30',
        os: 'Windows Server 2022',
        region: 'ap-northeast-1',
        max_sessions: 0,
      };

      return HttpResponse.json(settings);
    }
  ),

  http.put(
    `${API_BASE_URL}/streaming-games/:gameUuid/stream-settings`,
    async ({ params, request }) => {
      await delay(300);
      const { gameUuid } = params;
      const body = (await request.json()) as ApiStreamSettings;

      MOCK_STREAM_SETTINGS[gameUuid as string] = body;

      return HttpResponse.json(body);
    }
  ),
];
