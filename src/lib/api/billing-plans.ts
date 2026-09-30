import { apiClient } from "@/lib/api/http";
import type { Paginated, PaginationQuery } from "@/lib/api/types";

export type BillingCycle = "MONTHLY" | "QUARTERLY" | "SEMIANNUAL" | "ANNUAL";
export type CurrencyCode = "USD" | "EUR" | "COP";

export interface Plan {
  id: string;
  verticalId: string;
  code: string;
  name: string;
  billingCycle: BillingCycle;
  price: string;
  currency: CurrencyCode;
  description: string | null;
  isActive: boolean;
  isFeatured: boolean;
  sortOrder: number;
  features: Record<string, unknown> | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreatePlanDto {
  verticalId: string;
  code: string;
  name: string;
  billingCycle: BillingCycle;
  price: string;
  currency: CurrencyCode;
  description?: string;
  isActive?: boolean;
  isFeatured?: boolean;
  sortOrder?: number;
  features?: Record<string, unknown>;
}

export type UpdatePlanDto = Partial<Omit<CreatePlanDto, "verticalId">>;

export interface QueryPlansDto extends PaginationQuery {
  verticalId?: string;
  billingCycle?: BillingCycle;
  isActive?: boolean;
  isFeatured?: boolean;
  search?: string;
}

export async function listPlans(query: QueryPlansDto = {}): Promise<Paginated<Plan>> {
  const { data } = await apiClient.get<Paginated<Plan>>("/billing/plans", {
    params: query,
  });
  return data;
}

export async function getPlan(id: string): Promise<Plan> {
  const { data } = await apiClient.get<Plan>(`/billing/plans/${id}`);
  return data;
}

export async function createPlan(dto: CreatePlanDto): Promise<Plan> {
  const { data } = await apiClient.post<Plan>("/billing/plans", dto);
  return data;
}

export async function updatePlan(id: string, dto: UpdatePlanDto): Promise<Plan> {
  const { data } = await apiClient.patch<Plan>(`/billing/plans/${id}`, dto);
  return data;
}

export async function activatePlan(id: string): Promise<Plan> {
  const { data } = await apiClient.patch<Plan>(`/billing/plans/${id}/activate`);
  return data;
}

export async function deactivatePlan(id: string): Promise<Plan> {
  const { data } = await apiClient.patch<Plan>(`/billing/plans/${id}/deactivate`);
  return data;
}

export async function deletePlan(id: string): Promise<void> {
  await apiClient.delete(`/billing/plans/${id}`);
}
