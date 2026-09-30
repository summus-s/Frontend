import { apiClient } from "@/lib/api/http";
import type { Paginated, PaginationQuery } from "@/lib/api/types";
import type { Plan } from "@/lib/api/billing-plans";
import type { PaymentProvider } from "@/lib/api/billing-orders";

export type SubscriptionStatus = "TRIAL" | "ACTIVE" | "PAST_DUE" | "EXPIRED" | "CANCELED";

export interface Subscription {
  id: string;
  companyVerticalId: string;
  planId: string;
  plan?: Plan;
  status: SubscriptionStatus;
  currentPeriodStart: string;
  currentPeriodEnd: string;
  provider: PaymentProvider;
  providerCustomerId: string | null;
  providerSubscriptionId: string | null;
  planCodeSnapshot: string | null;
  planNameSnapshot: string | null;
  priceSnapshot: string | null;
  canceledAt: string | null;
  expiredAt: string | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateSubscriptionDto {
  companyVerticalId: string;
  planId: string;
  status?: SubscriptionStatus;
  currentPeriodStart: string;
  currentPeriodEnd: string;
  provider: PaymentProvider;
  providerCustomerId?: string;
  providerSubscriptionId?: string;
  notes?: string;
}

export interface UpdateSubscriptionDto {
  planId?: string;
  status?: SubscriptionStatus;
  currentPeriodStart?: string;
  currentPeriodEnd?: string;
  provider?: PaymentProvider;
  providerCustomerId?: string;
  providerSubscriptionId?: string;
  notes?: string;
}

export interface RenewSubscriptionDto {
  planId?: string;
  currentPeriodStart: string;
  currentPeriodEnd: string;
  provider?: PaymentProvider;
  providerCustomerId?: string;
  providerSubscriptionId?: string;
  notes?: string;
}

export interface QuerySubscriptionsDto extends PaginationQuery {
  companyVerticalId?: string;
  planId?: string;
  status?: SubscriptionStatus;
}

export async function listSubscriptions(
  query: QuerySubscriptionsDto = {},
): Promise<Paginated<Subscription>> {
  const { data } = await apiClient.get<Paginated<Subscription>>(
    "/billing/subscriptions",
    { params: query },
  );
  return data;
}

export async function getSubscription(id: string): Promise<Subscription> {
  const { data } = await apiClient.get<Subscription>(`/billing/subscriptions/${id}`);
  return data;
}

export async function createSubscription(
  dto: CreateSubscriptionDto,
): Promise<Subscription> {
  const { data } = await apiClient.post<Subscription>("/billing/subscriptions", dto);
  return data;
}

export async function updateSubscription(
  id: string,
  dto: UpdateSubscriptionDto,
): Promise<Subscription> {
  const { data } = await apiClient.patch<Subscription>(
    `/billing/subscriptions/${id}`,
    dto,
  );
  return data;
}

export async function renewSubscription(
  id: string,
  dto: RenewSubscriptionDto,
): Promise<Subscription> {
  const { data } = await apiClient.post<Subscription>(
    `/billing/subscriptions/${id}/renew`,
    dto,
  );
  return data;
}

export async function deleteSubscription(id: string): Promise<void> {
  await apiClient.delete(`/billing/subscriptions/${id}`);
}
