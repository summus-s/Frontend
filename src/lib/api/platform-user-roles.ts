import { apiClient } from "@/lib/api/http";
import type { Paginated, PaginationQuery } from "@/lib/api/types";

export interface PlatformUserRole {
  id: string;
  platformUserId: string;
  platformRoleId: string;
  companyVerticalId: string | null;
  isActive: boolean;
  reason: string | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreatePlatformUserRoleDto {
  platformUserId: string;
  platformRoleId: string;
  companyVerticalId?: string;
  reason?: string;
  notes?: string;
}

export interface QueryPlatformUserRolesDto extends PaginationQuery {
  platformUserId?: string;
  platformRoleId?: string;
  companyVerticalId?: string;
  isActive?: boolean;
}

export async function listPlatformUserRoles(
  query: QueryPlatformUserRolesDto = {},
): Promise<Paginated<PlatformUserRole>> {
  const { data } = await apiClient.get<Paginated<PlatformUserRole>>(
    "/platform-user-roles",
    { params: query },
  );
  return data;
}

// Bare array, not paginated.
export async function listPlatformUserRolesForUser(
  platformUserId: string,
): Promise<PlatformUserRole[]> {
  const { data } = await apiClient.get<PlatformUserRole[]>(
    `/platform-user-roles/user/${platformUserId}`,
  );
  return data;
}

export async function createPlatformUserRole(
  dto: CreatePlatformUserRoleDto,
): Promise<PlatformUserRole> {
  const { data } = await apiClient.post<PlatformUserRole>(
    "/platform-user-roles",
    dto,
  );
  return data;
}

export async function revokePlatformUserRole(
  id: string,
  payload?: { reason?: string; notes?: string },
): Promise<PlatformUserRole> {
  const { data } = await apiClient.patch<PlatformUserRole>(
    `/platform-user-roles/${id}/revoke`,
    payload ?? {},
  );
  return data;
}
