/**
 * Game Streaming MSW Handlers
 * Mock API handlers for game streaming features
 */
import { delay, http, HttpResponse } from 'msw';

import type {
  ApiBuild,
  ApiBuildCompleteRequest,
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
    game_uuid: 'source-game-001-uuid',
    game_name: 'Dark Souls Clone',
    game_genre: ['RPG', 'CASUAL'],
    created_at: '2025-12-15T10:00:00Z',
    is_streaming: true,
  },
  {
    game_uuid: 'source-game-002-uuid',
    game_name: 'Racing Simulator Pro',
    game_genre: ['SIMULATION', 'SPORTS'],
    created_at: '2025-12-16T11:00:00Z',
    is_streaming: true,
  },
  {
    game_uuid: 'source-game-003-uuid',
    game_name: 'Puzzle Adventure',
    game_genre: ['CASUAL'],
    created_at: '2025-12-17T09:00:00Z',
    is_streaming: false,
  },
  {
    game_uuid: 'source-game-004-uuid',
    game_name: 'Space Shooter X',
    game_genre: ['SHOOTER'],
    created_at: '2025-12-18T14:00:00Z',
    is_streaming: false,
  },
  {
    game_uuid: 'source-game-005-uuid',
    game_name: 'Fantasy Kingdom',
    game_genre: ['RPG', 'STRATEGY'],
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
    game_name: 'Dark Souls Clone',
    builds_count: 3,
    updated_at: '2025-12-20T10:30:00Z',
  },
  {
    game_uuid: 'game-002-uuid-efgh',
    game_name: 'Racing Simulator Pro',
    builds_count: 1,
    updated_at: '2025-12-18T15:45:00Z',
  },
];

const MOCK_GAME_BUILDS: Record<string, ApiBuild[]> = {
  'game-001-uuid-abcd': [
    {
      uuid: 'build-001',
      version: '1.0.0',
      status: 'READY',
      total_files: 150,
      total_size: 2_500_000_000,
      executable_path: '/Game/Binaries/Win64/DarkSouls.exe',
      os_type: 'WINDOWS',
      created_at: '2025-12-20T10:00:00Z',
      filename: 'dark-souls-v1.0.0.zip',
      size: 2_500_000_000,
      s3_key: 'builds/game-001/dark-souls-v1.0.0.zip',
      note: 'Initial release',
      updated_at: '2025-12-20T10:30:00Z',
    },
    {
      uuid: 'build-002',
      version: '1.1.0',
      status: 'UPLOADED',
      total_files: 160,
      total_size: 2_600_000_000,
      executable_path: '/Game/Binaries/Win64/DarkSouls.exe',
      os_type: 'WINDOWS',
      created_at: '2025-12-21T14:00:00Z',
      filename: 'dark-souls-v1.1.0.zip',
      size: 2_600_000_000,
      s3_key: 'builds/game-001/dark-souls-v1.1.0.zip',
      updated_at: '2025-12-21T14:05:00Z',
    },
    {
      uuid: 'build-003',
      version: '1.2.0-beta',
      status: 'PENDING',
      total_files: 175,
      total_size: 2_750_000_000,
      executable_path: '/Game/Binaries/Win64/DarkSouls.exe',
      os_type: 'WINDOWS',
      created_at: '2025-12-22T09:00:00Z',
      filename: 'dark-souls-v1.2.0-beta.zip',
      size: 2_750_000_000,
      s3_key: 'builds/game-001/dark-souls-v1.2.0-beta.zip',
      note: 'QA 검토중',
      updated_at: '2025-12-22T09:05:00Z',
    },
  ],
  'game-002-uuid-efgh': [
    {
      uuid: 'build-004',
      version: '2.0.0',
      status: 'READY',
      total_files: 200,
      total_size: 4_000_000_000,
      executable_path: '/RacingSim/Binaries/Win64/RacingSim.exe',
      os_type: 'WINDOWS',
      created_at: '2025-12-18T15:00:00Z',
      filename: 'racing-sim-v2.0.0.zip',
      size: 4_000_000_000,
      s3_key: 'builds/game-002/racing-sim-v2.0.0.zip',
      updated_at: '2025-12-18T15:45:00Z',
    },
    {
      uuid: 'build-005',
      version: '2.1.0',
      status: 'READY',
      total_files: 210,
      total_size: 4_200_000_000,
      executable_path: '/RacingSim/Binaries/Win64/RacingSim.exe',
      os_type: 'WINDOWS',
      created_at: '2025-12-20T12:30:00Z',
      filename: 'racing-sim-v2.1.0.zip',
      size: 4_200_000_000,
      s3_key: 'builds/game-002/racing-sim-v2.1.0.zip',
      note: '레이싱 트랙 조정 완료',
      updated_at: '2025-12-20T12:45:00Z',
    },
  ],
};

let buildCounter = 100;

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
    const body = (await request.json()) as { game_uuid: string };

    // Source Game 찾기
    const sourceGame = SOURCE_GAMES.find((g) => g.game_uuid === body.game_uuid);
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

    const newStreamingGame: ApiStreamingGame = {
      game_uuid: sourceGame.game_uuid,
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
      const sourceGame = SOURCE_GAMES.find(
        (g) => g.game_uuid === game.game_uuid
      );
      if (sourceGame) {
        sourceGame.is_streaming = false;
      }

      STREAMING_GAMES.splice(gameIndex, 1);
      delete MOCK_GAME_BUILDS[gameUuid as string];

      return HttpResponse.json({ success: true });
    }
  ),

  // ----------------------------------------
  // Games API (Creator Studio)
  // ----------------------------------------
  http.get(`${API_BASE_URL}/games`, async () => {
    await delay(300);
    return HttpResponse.json({
      result: STREAMING_GAMES.map((g) => ({
        game_uuid: g.game_uuid,
        game_name: g.game_name,
        builds_count: g.builds_count,
        updated_at: g.updated_at,
      })),
    });
  }),

  // ----------------------------------------
  // Builds API
  // ----------------------------------------
  http.get(
    `${API_BASE_URL}/streaming-games/:gameUuid/builds`,
    async ({ params }) => {
      await delay(300);
      const { gameUuid } = params;
      const builds = MOCK_GAME_BUILDS[gameUuid as string] || [];
      return HttpResponse.json({ result: builds });
    }
  ),

  // Legacy builds endpoint
  http.get(`${API_BASE_URL}/games/:gameUuid/builds`, async ({ params }) => {
    await delay(300);
    const { gameUuid } = params;
    const builds = MOCK_GAME_BUILDS[gameUuid as string] || [];
    return HttpResponse.json({ result: builds });
  }),

  // 빌드 생성 및 STS Credentials 발급 (Spring GameBuildApi.createBuild)
  http.post(
    `${API_BASE_URL}/games/:gameUuid/builds`,
    async ({ params, request }) => {
      await delay(500);
      const { gameUuid } = params;
      const body = (await request.json()) as { version: string };

      buildCounter++;
      const buildUuid = `build-${buildCounter}-${crypto.randomUUID().slice(0, 8)}`;
      const s3Prefix = `${gameUuid}/${buildUuid}/`;

      const response: ApiCreateBuildResponse = {
        result: {
          build_id: buildUuid,
          version: body.version,
          s3_prefix: s3Prefix,
          credentials: {
            access_key_id: 'AKIAIOSFODNN7EXAMPLE',
            secret_access_key: 'wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY',
            session_token: 'FwoGZXIvYXdzEBYaDMockSessionToken==',
            expiration: Date.now() + 3600000, // epoch timestamp
          },
        },
      };

      return HttpResponse.json(response, { status: 201 });
    }
  ),

  // Build Complete (Spring GameBuildApi.completeUpload)
  http.post(
    `${API_BASE_URL}/games/:gameUuid/builds/:buildUuid/complete`,
    async ({ params, request }) => {
      await delay(300);
      const { gameUuid, buildUuid } = params;
      const body = (await request.json()) as ApiBuildCompleteRequest;

      // MOCK_GAME_BUILDS에 빌드 추가
      const newBuild: ApiBuild = {
        uuid: buildUuid as string,
        version: '1.0.0',
        status: 'UPLOADED',
        total_files: body.expected_file_count,
        total_size: body.expected_total_size,
        executable_path: body.executable_path,
        os_type: body.os_type,
        created_at: new Date().toISOString(),
        filename: `build-${buildUuid}`,
        size: body.expected_total_size,
        s3_key: `${gameUuid}/${buildUuid}/`,
        updated_at: new Date().toISOString(),
      };

      if (!MOCK_GAME_BUILDS[gameUuid as string]) {
        MOCK_GAME_BUILDS[gameUuid as string] = [];
      }
      MOCK_GAME_BUILDS[gameUuid as string].push(newBuild);

      const response: ApiBuildCompleteResponse = {
        result: {
          uuid: buildUuid as string,
          status: 'UPLOADED',
          executable_path: body.executable_path,
          os_type: body.os_type,
        },
      };

      return HttpResponse.json(response);
    }
  ),

  // Build Delete (Spring GameBuildApi.deleteBuild)
  http.delete(
    `${API_BASE_URL}/games/:gameUuid/builds/:buildUuid`,
    async ({ params }) => {
      await delay(300);
      const { gameUuid, buildUuid } = params;

      const builds = MOCK_GAME_BUILDS[gameUuid as string];
      if (builds) {
        const index = builds.findIndex((b) => b.uuid === buildUuid);
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
