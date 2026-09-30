import { apiClient } from "@/lib/api/http";
import type { DocumentType } from "@/lib/document-types";

export interface CreateRegistrationDto {
  verticalId: string;
  planId: string;
  companyName: string;
  legalName?: string;
  documentType?: DocumentType;
  taxId?: string;
  country?: string;
  city?: string;
  address?: string;
  contactFullName: string;
  contactEmail: string;
  contactPhone?: string;
}

export interface RegistrationResult {
  companyId: string;
  companyVerticalId: string;
  orderId: string;
  checkoutUrl: string;
}

export async function createRegistration(
  dto: CreateRegistrationDto,
): Promise<RegistrationResult> {
  const { data } = await apiClient.post<RegistrationResult>(
    "/public/registrations",
    dto,
    { skipAuth: true },
  );
  return data;
}
