import { apiClient } from "@/lib/api/http";
import type { Paginated, PaginationQuery } from "@/lib/api/types";
import type { Company } from "@/lib/api/companies";
import type { Vertical } from "@/lib/api/verticals";

export type CompanyVerticalStatus = "PENDING" | "ACTIVE" | "SUSPENDED" | "CANCELED";

export interface CompanyVertical {
  id: string;
  companyId: string;
  company?: Company;
  verticalId: string;
  vertical?: Vertical;
  status: CompanyVerticalStatus;
  activatedAt: string | null;
  suspendedReason: string | null;
  suspendedAt: string | null;
  canceledAt: string | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateCompanyVerticalDto {
  companyId: string;
  verticalId: string;
  notes?: string;
}

export interface UpdateCompanyVerticalDto {
  notes?: string;
}

export interface QueryCompanyVerticalsDto extends PaginationQuery {
  companyId?: string;
  verticalId?: string;
  status?: CompanyVerticalStatus;
}

export async function listCompanyVerticals(
  query: QueryCompanyVerticalsDto = {},
): Promise<Paginated<CompanyVertical>> {
  const { data } = await apiClient.get<Paginated<CompanyVertical>>(
    "/company-verticals",
    { params: query },
  );
  return data;
}

export async function getCompanyVertical(id: string): Promise<CompanyVertical> {
  const { data } = await apiClient.get<CompanyVertical>(`/company-verticals/${id}`);
  return data;
}

export async function createCompanyVertical(
  dto: CreateCompanyVerticalDto,
): Promise<CompanyVertical> {
  const { data } = await apiClient.post<CompanyVertical>("/company-verticals", dto);
  return data;
}

export async function updateCompanyVertical(
  id: string,
  dto: UpdateCompanyVerticalDto,
): Promise<CompanyVertical> {
  const { data } = await apiClient.patch<CompanyVertical>(
    `/company-verticals/${id}`,
    dto,
  );
  return data;
}

export async function setCompanyVerticalStatus(
  id: string,
  status: CompanyVerticalStatus,
  reason?: string,
): Promise<CompanyVertical> {
  const { data } = await apiClient.patch<CompanyVertical>(
    `/company-verticals/${id}/status`,
    { status, reason },
  );
  return data;
}

export async function deleteCompanyVertical(id: string): Promise<void> {
  await apiClient.delete(`/company-verticals/${id}`);
}
