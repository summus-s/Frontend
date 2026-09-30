import { apiClient } from "@/lib/api/http";

export type PlatformRoleKey =
  | "SUPERADMIN"
  | "SALES"
  | "SUPPORT"
  | "ACCOUNTING"
  | "AUDITOR";

export type PlatformUserStatus = "ACTIVE" | "DISABLED";

export interface SanitizedUser {
  id: string;
  email: string;
  fullName: string;
  status: PlatformUserStatus;
  roles: PlatformRoleKey[];
  lastLoginAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface AuthResponse {
  user: SanitizedUser;
  accessToken: string;
  refreshToken: string;
}

export interface LoginDto {
  email: string;
  password: string;
}

export async function login(dto: LoginDto): Promise<AuthResponse> {
  const { data } = await apiClient.post<AuthResponse>("/platform-auth/login", dto, {
    skipAuth: true,
  });
  return data;
}

export async function refresh(refreshToken: string): Promise<AuthResponse> {
  const { data } = await apiClient.post<AuthResponse>(
    "/platform-auth/refresh",
    { refreshToken },
    { skipAuth: true },
  );
  return data;
}

export async function forgotPassword(email: string): Promise<{ message: string }> {
  const { data } = await apiClient.post<{ message: string }>(
    "/platform-auth/forgot-password",
    { email },
    { skipAuth: true },
  );
  return data;
}

export async function resetPassword(
  token: string,
  newPassword: string,
): Promise<{ message: string }> {
  const { data } = await apiClient.post<{ message: string }>(
    "/platform-auth/reset-password",
    { token, newPassword },
    { skipAuth: true },
  );
  return data;
}

export async function logout(): Promise<void> {
  await apiClient.post("/platform-auth/logout");
}

export async function changePassword(
  currentPassword: string,
  newPassword: string,
): Promise<{ message: string }> {
  const { data } = await apiClient.post<{ message: string }>(
    "/platform-auth/change-password",
    { currentPassword, newPassword },
  );
  return data;
}

export async function me(): Promise<SanitizedUser> {
  const { data } = await apiClient.get<SanitizedUser>("/platform-auth/me");
  return data;
}
