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

export const TabValue = {
  ACCOUNT: 'account',
  WORKSPACE: 'workspace',
  TEAM: 'team',
  BILLING: 'billing',
} as const;

export type TabValue = (typeof TabValue)[keyof typeof TabValue];
