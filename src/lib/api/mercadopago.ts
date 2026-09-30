import { apiClient } from "@/lib/api/http";

export interface CreateCheckoutResult {
  checkoutUrl: string;
  preferenceId: string;
}

export async function createOrderCheckout(orderId: string): Promise<CreateCheckoutResult> {
  const { data } = await apiClient.post<CreateCheckoutResult>(
    `/integrations/mercadopago/orders/${orderId}/checkout`,
  );
  return data;
}
