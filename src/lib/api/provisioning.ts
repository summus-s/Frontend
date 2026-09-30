import { apiClient } from "@/lib/api/http";
import type { VerticalTenant } from "@/lib/api/vertical-tenants";

export interface ProvisionVerticalTenantDto {
  force?: boolean;
  syncReference?: string;
  notes?: string;
}

export async function provisionVerticalTenant(
  verticalTenantId: string,
  dto: ProvisionVerticalTenantDto = {},
): Promise<VerticalTenant> {
  const { data } = await apiClient.post<VerticalTenant>(
    `/integrations/vertical-provisioning/${verticalTenantId}/provision`,
    dto,
  );
  return data;
}
