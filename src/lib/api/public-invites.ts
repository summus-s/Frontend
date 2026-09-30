import { apiClient } from "@/lib/api/http";

export interface PublicInviteDetails {
  id: string;
  email: string;
  fullName: string | null;
  roleHint: string | null;
  status: string;
  expiresAt: string;
  company: { id: string; name: string; legalName: string | null };
  companyVertical: {
    id: string;
    status: string;
    vertical: {
      id: string;
      key: string;
      name: string;
      description: string | null;
      marketingPath: string;
      appBaseUrl: string;
    };
  };
}

export interface AcceptInviteResult {
  success: true;
  inviteId: string;
  status: "USED";
  usedAt: string;
  onboarding: {
    companyId: string;
    companyVerticalId: string;
    verticalId: string;
    verticalKey: string;
    verticalName: string;
    verticalAppBaseUrl: string;
    tenant: {
      id: string;
      externalTenantId: string | null;
      externalWorkspace: string | null;
      externalUrl: string | null;
    };
    access: { email: string; fullName: string | null; roleHint: string | null };
  };
  message: string;
}

export async function getPublicInvite(token: string): Promise<PublicInviteDetails> {
  const { data } = await apiClient.get<PublicInviteDetails>(
    `/public/invites/${token}`,
    { skipAuth: true },
  );
  return data;
}

export async function acceptPublicInvite(
  token: string,
  dto: { email: string; fullName?: string },
): Promise<AcceptInviteResult> {
  const { data } = await apiClient.post<AcceptInviteResult>(
    `/public/invites/${token}/accept`,
    dto,
    { skipAuth: true },
  );
  return data;
}
