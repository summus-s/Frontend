import { apiClient } from "@/lib/api/http";
import type { BillingCycle, CurrencyCode } from "@/lib/api/billing-plans";

export interface PublicPlan {
  id: string;
  code: string;
  name: string;
  description: string | null;
  billingCycle: BillingCycle;
  price: string;
  currency: CurrencyCode;
  isFeatured: boolean;
}

export async function listPublicPlans(verticalId: string): Promise<PublicPlan[]> {
  const { data } = await apiClient.get<PublicPlan[]>(
    `/public/verticals/${verticalId}/plans`,
    { skipAuth: true },
  );
  return data;
}
