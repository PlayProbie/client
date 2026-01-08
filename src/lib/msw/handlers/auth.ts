/**
 * Auth API MSW Handlers
 * 인증 관련 API 목 핸들러
 */
import { delay, http, HttpResponse } from 'msw';

import { API_BASE_URL } from '@/constants/api';
import type {
  LoginRequest,
  LoginResponse,
  LogoutResponse,
  SignupRequest,
  SignupResponse,
} from '@/features/auth/types';

// ----------------------------------------
// Mock Data
// ----------------------------------------

/** 테스트용 사용자 계정 */
const MOCK_USERS: Array<{
  id: number;
  email: string;
  password: string;
  name: string;
}> = [
  {
    id: 1,
    email: 'test@example.com',
    password: 'password123',
    name: '테스트 사용자',
  },
  {
    id: 2,
    email: 'admin@playprobie.com',
    password: 'admin123',
    name: '관리자',
  },
];

let userIdCounter = 100;

// ----------------------------------------
// Handlers
// ----------------------------------------

export const authHandlers = [
  // POST /auth/login - 로그인
  http.post(`${API_BASE_URL}/auth/login`, async ({ request }) => {
    await delay(500);
    const body = (await request.json()) as LoginRequest;

    const user = MOCK_USERS.find(
      (u) => u.email === body.email && u.password === body.password
    );

    if (!user) {
      return HttpResponse.json(
        { message: '이메일 또는 비밀번호가 올바르지 않습니다.' },
        { status: 401 }
      );
    }

    const response: LoginResponse = {
      result: {
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
        },
        access_token: `mock-jwt-token-${user.id}-${Date.now()}`,
      },
    };

    return HttpResponse.json(response);
  }),

  // POST /auth/logout - 로그아웃
  http.post(`${API_BASE_URL}/auth/logout`, async () => {
    await delay(300);

    const response: LogoutResponse = {
      result: {
        message: '로그아웃되었습니다.',
      },
    };

    return HttpResponse.json(response);
  }),

  // POST /auth/signup - 회원가입
  http.post(`${API_BASE_URL}/auth/signup`, async ({ request }) => {
    await delay(500);
    const body = (await request.json()) as SignupRequest;

    // 이메일 중복 체크
    const existingUser = MOCK_USERS.find((u) => u.email === body.email);
    if (existingUser) {
      return HttpResponse.json(
        { message: '이미 사용 중인 이메일입니다.' },
        { status: 409 }
      );
    }

    // 새 사용자 생성
    userIdCounter++;
    const newUser = {
      id: userIdCounter,
      email: body.email,
      password: body.password,
      name: body.name,
    };

    MOCK_USERS.push(newUser);

    const response: SignupResponse = {
      result: {
        id: newUser.id,
        email: newUser.email,
        name: newUser.name,
      },
    };

    return HttpResponse.json(response, { status: 201 });
  }),
];
