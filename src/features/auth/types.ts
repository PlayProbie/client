// Auth Types

// ============ Login ============
export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginUser {
  id: number;
  email: string;
  name: string;
}

export interface LoginResult {
  user: LoginUser;
  access_token: string;
}

export interface LoginResponse {
  result: LoginResult;
}

// ============ Signup ============
export interface SignupRequest {
  email: string;
  password: string;
  name: string;
  phone?: string;
}

export interface SignupResponse {
  result: {
    id: number;
    email: string;
    name: string;
  };
}

// ============ Logout ============
export interface LogoutResponse {
  result: {
    message: string;
  };
}
