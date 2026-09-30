import { apiClient } from "@/lib/api/http";
import type { Paginated, PaginationQuery } from "@/lib/api/types";
import type { PlatformRoleKey } from "@/lib/api/auth";

export interface PlatformRole {
  id: string;
  key: PlatformRoleKey;
  name: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreatePlatformRoleDto {
  key: PlatformRoleKey;
  name: string;
}

export async function listPlatformRoles(
  query: PaginationQuery = {},
): Promise<Paginated<PlatformRole>> {
  const { data } = await apiClient.get<Paginated<PlatformRole>>("/platform-roles", {
    params: query,
  });
  return data;
}

export async function getPlatformRole(id: string): Promise<PlatformRole> {
  const { data } = await apiClient.get<PlatformRole>(`/platform-roles/${id}`);
  return data;
}

export async function createPlatformRole(
  dto: CreatePlatformRoleDto,
): Promise<PlatformRole> {
  const { data } = await apiClient.post<PlatformRole>("/platform-roles", dto);
  return data;
}

export async function updatePlatformRole(
  id: string,
  name: string,
): Promise<PlatformRole> {
  const { data } = await apiClient.patch<PlatformRole>(`/platform-roles/${id}`, {
    name,
  });
  return data;
}

export async function deletePlatformRole(id: string): Promise<void> {
  await apiClient.delete(`/platform-roles/${id}`);
}
