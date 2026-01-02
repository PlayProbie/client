// Mock user data types - will be replaced with actual user context
export interface WorkspaceRole {
  name: string;
  role: string;
  permission: string;
}

export interface User {
  name: string;
  email: string;
  avatar: string;
  workspace: WorkspaceRole;
}

// Mock data - TODO: Replace with actual user context from useAuthStore
export const MOCK_USER: User = {
  name: '김개발',
  email: 'dev@playprobie.com',
  avatar: 'https://ui-avatars.com/api/?name=Kim&background=4F46E5&color=fff',
  workspace: {
    name: '스튜디오 A',
    role: '관리자',
    permission: 'Owner',
  },
};
