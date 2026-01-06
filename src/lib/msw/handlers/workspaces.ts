/**
 * MSW Handlers - Workspaces
 * 워크스페이스 API 목 핸들러
 */
import { http, HttpResponse } from 'msw';

import { API_BASE_URL } from '@/constants/api';
import type {
  ApiCreateWorkspaceRequest,
  ApiWorkspace,
  ApiWorkspaceResponse,
  ApiWorkspacesListResponse,
} from '@/features/workspace/types';

// Mock 데이터
const mockWorkspaces: ApiWorkspace[] = [
  {
    workspace_uuid: '550e8400-e29b-41d4-a716-446655440000',
    name: '스튜디오 A',
    profile_image_url: null,
    description: '인디 게임 개발 스튜디오',
    game_count: 3,
    created_at: '2026-01-01T00:00:00.000Z',
    updated_at: '2026-01-01T00:00:00.000Z',
  },
  {
    workspace_uuid: '550e8400-e29b-41d4-a716-446655440001',
    name: '스튜디오 B',
    profile_image_url: null,
    description: 'AAA 게임 개발사',
    game_count: 5,
    created_at: '2026-01-02T00:00:00.000Z',
    updated_at: '2026-01-02T00:00:00.000Z',
  },
];

export const workspacesHandlers = [
  // GET /workspaces - 워크스페이스 목록 조회
  http.get(`${API_BASE_URL}/workspaces`, () => {
    const response: ApiWorkspacesListResponse = {
      result: mockWorkspaces,
    };
    return HttpResponse.json(response);
  }),

  // POST /workspaces - 워크스페이스 생성
  http.post(`${API_BASE_URL}/workspaces`, async ({ request }) => {
    const body = (await request.json()) as ApiCreateWorkspaceRequest;

    const newWorkspace: ApiWorkspace = {
      workspace_uuid: crypto.randomUUID(),
      name: body.name,
      profile_image_url: null,
      description: body.description || null,
      game_count: 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    mockWorkspaces.push(newWorkspace);

    const response: ApiWorkspaceResponse = {
      result: newWorkspace,
    };
    return HttpResponse.json(response, { status: 201 });
  }),
];
