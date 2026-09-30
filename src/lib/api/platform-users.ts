import { apiClient } from "@/lib/api/http";
import type { PlatformRoleKey, PlatformUserStatus } from "@/lib/api/auth";

export interface PlatformUserRoleAssignment {
  id: string;
  platformRoleId: string;
  platformRole?: { id: string; key: PlatformRoleKey; name: string };
  isActive: boolean;
}

export interface PlatformUser {
  id: string;
  email: string;
  fullName: string;
  status: PlatformUserStatus;
  lastLoginAt: string | null;
  platformUserRoles: PlatformUserRoleAssignment[];
  createdAt: string;
  updatedAt: string;
}

export interface CreatePlatformUserDto {
  email: string;
  password: string;
  fullName: string;
  status?: PlatformUserStatus;
  roleKeys?: PlatformRoleKey[];
}

export type UpdatePlatformUserDto = Partial<CreatePlatformUserDto>;

export interface QueryPlatformUsersDto {
  search?: string;
  email?: string;
  status?: PlatformUserStatus;
  roleKey?: PlatformRoleKey;
}

// Note: unlike most list endpoints, this one returns a bare array (no pagination envelope).
export async function listPlatformUsers(
  query: QueryPlatformUsersDto = {},
): Promise<PlatformUser[]> {
  const { data } = await apiClient.get<PlatformUser[]>("/platform-users", {
    params: query,
  });
  return data;
}

export async function getPlatformUser(id: string): Promise<PlatformUser> {
  const { data } = await apiClient.get<PlatformUser>(`/platform-users/${id}`);
  return data;
}

export async function createPlatformUser(
  dto: CreatePlatformUserDto,
): Promise<PlatformUser> {
  const { data } = await apiClient.post<PlatformUser>("/platform-users", dto);
  return data;
}

export async function updatePlatformUser(
  id: string,
  dto: UpdatePlatformUserDto,
): Promise<PlatformUser> {
  const { data } = await apiClient.patch<PlatformUser>(`/platform-users/${id}`, dto);
  return data;
}

export async function setPlatformUserStatus(
  id: string,
  status: PlatformUserStatus,
): Promise<PlatformUser> {
  const { data } = await apiClient.patch<PlatformUser>(
    `/platform-users/${id}/status`,
    { status },
  );
  return data;
}

export async function deletePlatformUser(id: string): Promise<void> {
  await apiClient.delete(`/platform-users/${id}`);
}
