import { apiClient } from "@/lib/api/http";
import type { Paginated, PaginationQuery } from "@/lib/api/types";

export type InviteStatus = "PENDING" | "USED" | "EXPIRED" | "REVOKED";

export interface Invite {
  id: string;
  companyVerticalId: string;
  email: string;
  fullName: string | null;
  roleHint: string | null;
  status: InviteStatus;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateInviteDto {
  companyVerticalId: string;
  email: string;
  fullName?: string;
  roleHint?: string;
  notes?: string;
}

export interface QueryInvitesDto extends PaginationQuery {
  companyVerticalId?: string;
  createdBy?: string;
  status?: InviteStatus;
  email?: string;
  search?: string;
}

export async function listInvites(
  query: QueryInvitesDto = {},
): Promise<Paginated<Invite>> {
  const { data } = await apiClient.get<Paginated<Invite>>("/invites", {
    params: query,
  });
  return data;
}

export async function getInvite(id: string): Promise<Invite> {
  const { data } = await apiClient.get<Invite>(`/invites/${id}`);
  return data;
}

export async function createInvite(dto: CreateInviteDto): Promise<Invite> {
  const { data } = await apiClient.post<Invite>("/invites", dto);
  return data;
}

export async function resendInvite(
  id: string,
  payload?: { reason?: string; notes?: string },
): Promise<Invite> {
  const { data } = await apiClient.patch<Invite>(`/invites/${id}/resend`, payload ?? {});
  return data;
}

export async function revokeInvite(
  id: string,
  payload?: { reason?: string; notes?: string },
): Promise<Invite> {
  const { data } = await apiClient.patch<Invite>(`/invites/${id}/revoke`, payload ?? {});
  return data;
}
