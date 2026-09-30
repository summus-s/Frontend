import { apiClient } from "@/lib/api/http";
import type { Paginated, PaginationQuery } from "@/lib/api/types";
import type { DocumentType } from "@/lib/document-types";

export type CompanyStatus = "ACTIVE" | "SUSPENDED" | "DELETED";

export interface Company {
  id: string;
  name: string;
  legalName: string | null;
  documentType: DocumentType | null;
  taxId: string | null;
  status: CompanyStatus;
  suspendedReason: string | null;
  email: string | null;
  phone: string | null;
  country: string | null;
  city: string | null;
  address: string | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateCompanyDto {
  name: string;
  legalName?: string;
  documentType?: DocumentType;
  taxId?: string;
  email?: string;
  phone?: string;
  country?: string;
  city?: string;
  address?: string;
  notes?: string;
}

export type UpdateCompanyDto = Partial<CreateCompanyDto>;

export interface QueryCompaniesDto extends PaginationQuery {
  search?: string;
  status?: CompanyStatus;
  taxId?: string;
}

export async function listCompanies(
  query: QueryCompaniesDto = {},
): Promise<Paginated<Company>> {
  const { data } = await apiClient.get<Paginated<Company>>("/companies", {
    params: query,
  });
  return data;
}

export async function getCompany(id: string): Promise<Company> {
  const { data } = await apiClient.get<Company>(`/companies/${id}`);
  return data;
}

export async function createCompany(dto: CreateCompanyDto): Promise<Company> {
  const { data } = await apiClient.post<Company>("/companies", dto);
  return data;
}

export async function updateCompany(
  id: string,
  dto: UpdateCompanyDto,
): Promise<Company> {
  const { data } = await apiClient.patch<Company>(`/companies/${id}`, dto);
  return data;
}

export async function setCompanyStatus(
  id: string,
  status: CompanyStatus,
  reason?: string,
): Promise<Company> {
  const { data } = await apiClient.patch<Company>(`/companies/${id}/status`, {
    status,
    reason,
  });
  return data;
}

export async function deleteCompany(id: string): Promise<void> {
  await apiClient.delete(`/companies/${id}`);
}
