import { apiClient } from "@/lib/api/http";
import type { Paginated, PaginationQuery } from "@/lib/api/types";
import type { CurrencyCode } from "@/lib/api/billing-plans";

export type OrderStatus = "PENDING" | "PAID" | "FAILED" | "CANCELED";
export type PaymentProvider = "MANUAL" | "STRIPE" | "MERCADOPAGO";

export interface Order {
  id: string;
  companyVerticalId: string;
  subscriptionId: string | null;
  planId: string | null;
  status: OrderStatus;
  totalAmount: string;
  currency: CurrencyCode;
  provider: PaymentProvider;
  providerPaymentId: string | null;
  externalReference: string | null;
  type: string | null;
  planCodeSnapshot: string | null;
  planNameSnapshot: string | null;
  failureCode: string | null;
  failureMessage: string | null;
  notes: string | null;
  paidAt: string | null;
  failedAt: string | null;
  canceledAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateOrderDto {
  companyVerticalId: string;
  subscriptionId?: string;
  planId?: string;
  totalAmount: string;
  currency: CurrencyCode;
  provider: PaymentProvider;
  providerPaymentId?: string;
  externalReference?: string;
  type?: string;
  notes?: string;
}

export interface UpdateOrderDto {
  status?: OrderStatus;
  providerPaymentId?: string;
  externalReference?: string;
  failureCode?: string;
  failureMessage?: string;
  notes?: string;
}

export interface QueryOrdersDto extends PaginationQuery {
  companyVerticalId?: string;
  subscriptionId?: string;
  status?: OrderStatus;
}

export async function listOrders(query: QueryOrdersDto = {}): Promise<Paginated<Order>> {
  const { data } = await apiClient.get<Paginated<Order>>("/billing/orders", {
    params: query,
  });
  return data;
}

export async function getOrder(id: string): Promise<Order> {
  const { data } = await apiClient.get<Order>(`/billing/orders/${id}`);
  return data;
}

export async function createOrder(dto: CreateOrderDto): Promise<Order> {
  const { data } = await apiClient.post<Order>("/billing/orders", dto);
  return data;
}

export async function updateOrder(id: string, dto: UpdateOrderDto): Promise<Order> {
  const { data } = await apiClient.patch<Order>(`/billing/orders/${id}`, dto);
  return data;
}

export async function deleteOrder(id: string): Promise<void> {
  await apiClient.delete(`/billing/orders/${id}`);
}
