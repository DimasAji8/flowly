import { apiClient } from "@/lib/api-client";
import type { AuthMeResponse, AuthSession } from "@/types/auth";

export interface RegisterPayload {
  name: string;
  email: string;
  password: string;
  gender?: "m" | "f";
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface ForgotPasswordPayload {
  email: string;
}

export interface ResetPasswordPayload {
  token: string;
  newPassword: string;
}

export const authService = {
  register(payload: RegisterPayload) {
    return apiClient.post<AuthSession>("/auth/register", payload);
  },

  login(payload: LoginPayload) {
    return apiClient.post<AuthSession>("/auth/login", payload);
  },

  me() {
    return apiClient.get<AuthMeResponse>("/auth/me", { auth: true });
  },

  forgotPassword(payload: ForgotPasswordPayload) {
    return apiClient.post<{ message: string; token?: string }>("/auth/forgot-password", payload);
  },

  resetPassword(payload: ResetPasswordPayload) {
    return apiClient.post<{ message: string }>("/auth/reset-password", payload);
  },

  changePassword(payload: { currentPassword: string; newPassword: string }) {
    return apiClient.post<{ message: string }>("/auth/change-password", payload, { auth: true });
  },
};
