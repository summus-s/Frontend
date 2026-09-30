import { apiClient } from "@/lib/api/http";

export interface HealthResponse {
  status: "ok" | "error";
  info?: Record<string, unknown>;
  error?: Record<string, unknown>;
  details?: Record<string, unknown>;
}

export async function getHealth(): Promise<HealthResponse> {
  const { data } = await apiClient.get<HealthResponse>("/health", { skipAuth: true });
  return data;
}
