import { apiClient } from "@/lib/api/http";
import type { Paginated, PaginationQuery } from "@/lib/api/types";

export type VerticalTenantStatus = "PENDING" | "PROVISIONING" | "PROVISIONED" | "FAILED";

export interface VerticalTenant {
  id: string;
  companyVerticalId: string;
  externalTenantId: string | null;
  externalWorkspace: string | null;
  externalWorkspaceId: string | null;
  externalUrl: string | null;
  syncReference: string | null;
  status: VerticalTenantStatus;
  provisionedAt: string | null;
  lastAttemptAt: string | null;
  provisioningAttempts: number;
  lastErrorCode: string | null;
  lastErrorMessage: string | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateVerticalTenantDto {
  companyVerticalId: string;
  externalTenantId?: string;
  externalWorkspace?: string;
  externalWorkspaceId?: string;
  externalUrl?: string;
  syncReference?: string;
  notes?: string;
}

export type UpdateVerticalTenantDto = Partial<
  Omit<CreateVerticalTenantDto, "companyVerticalId">
>;

export interface QueryVerticalTenantsDto extends PaginationQuery {
  companyVerticalId?: string;
  status?: VerticalTenantStatus;
}

export async function listVerticalTenants(
  query: QueryVerticalTenantsDto = {},
): Promise<Paginated<VerticalTenant>> {
  const { data } = await apiClient.get<Paginated<VerticalTenant>>(
    "/vertical-tenants",
    { params: query },
  );
  return data;
}

export async function getVerticalTenant(id: string): Promise<VerticalTenant> {
  const { data } = await apiClient.get<VerticalTenant>(`/vertical-tenants/${id}`);
  return data;
}

export async function createVerticalTenant(
  dto: CreateVerticalTenantDto,
): Promise<VerticalTenant> {
  const { data } = await apiClient.post<VerticalTenant>("/vertical-tenants", dto);
  return data;
}

export async function updateVerticalTenant(
  id: string,
  dto: UpdateVerticalTenantDto,
): Promise<VerticalTenant> {
  const { data } = await apiClient.patch<VerticalTenant>(
    `/vertical-tenants/${id}`,
    dto,
  );
  return data;
}

export async function startProvisioning(
  id: string,
  payload?: { syncReference?: string; requestPayload?: Record<string, unknown>; notes?: string },
): Promise<VerticalTenant> {
  const { data } = await apiClient.patch<VerticalTenant>(
    `/vertical-tenants/${id}/start-provisioning`,
    payload ?? {},
  );
  return data;
}

export async function markVerticalTenantProvisioned(
  id: string,
  payload: Partial<CreateVerticalTenantDto> & { responsePayload?: Record<string, unknown> },
): Promise<VerticalTenant> {
  const { data } = await apiClient.patch<VerticalTenant>(
    `/vertical-tenants/${id}/mark-provisioned`,
    payload,
  );
  return data;
}

export async function markVerticalTenantFailed(
  id: string,
  payload: { errorCode?: string; errorMessage?: string; responsePayload?: Record<string, unknown> },
): Promise<VerticalTenant> {
  const { data } = await apiClient.patch<VerticalTenant>(
    `/vertical-tenants/${id}/mark-failed`,
    payload,
  );
  return data;
}

export async function deleteVerticalTenant(id: string): Promise<void> {
  await apiClient.delete(`/vertical-tenants/${id}`);
}
