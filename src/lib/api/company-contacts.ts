import { apiClient } from "@/lib/api/http";
import type { Paginated, PaginationQuery } from "@/lib/api/types";

export interface CompanyContact {
  id: string;
  companyId: string;
  fullName: string;
  email: string;
  phone: string | null;
  isPrimary: boolean;
  createdAt: string;
}

export interface CreateCompanyContactDto {
  companyId: string;
  fullName: string;
  email: string;
  phone?: string;
  isPrimary?: boolean;
}

export type UpdateCompanyContactDto = Partial<
  Omit<CreateCompanyContactDto, "companyId">
>;

export interface QueryCompanyContactsDto extends PaginationQuery {
  companyId?: string;
}

export async function listCompanyContacts(
  query: QueryCompanyContactsDto = {},
): Promise<Paginated<CompanyContact>> {
  const { data } = await apiClient.get<Paginated<CompanyContact>>(
    "/company-contacts",
    { params: query },
  );
  return data;
}

export async function getCompanyContact(id: string): Promise<CompanyContact> {
  const { data } = await apiClient.get<CompanyContact>(`/company-contacts/${id}`);
  return data;
}

export async function createCompanyContact(
  dto: CreateCompanyContactDto,
): Promise<CompanyContact> {
  const { data } = await apiClient.post<CompanyContact>("/company-contacts", dto);
  return data;
}

export async function updateCompanyContact(
  id: string,
  dto: UpdateCompanyContactDto,
): Promise<CompanyContact> {
  const { data } = await apiClient.patch<CompanyContact>(
    `/company-contacts/${id}`,
    dto,
  );
  return data;
}

export async function deleteCompanyContact(id: string): Promise<void> {
  await apiClient.delete(`/company-contacts/${id}`);
}
