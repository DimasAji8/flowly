export interface AuthUser {
  id: string;
  name: string;
  email: string;
  gender?: "m" | "f" | null;
  createdAt?: string;
}

export interface AuthSession {
  user: AuthUser;
  workspaceId: string;
  accessToken: string;
  refreshToken: string;
}

export interface AuthMeResponse {
  user: AuthUser;
}
