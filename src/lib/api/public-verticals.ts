import { apiClient } from "@/lib/api/http";

export interface PublicVertical {
  id: string;
  key: string;
  name: string;
  description: string | null;
  marketingPath: string;
  appBaseUrl: string;
}

export async function listPublicVerticals(): Promise<PublicVertical[]> {
  const { data } = await apiClient.get<PublicVertical[]>("/public/verticals", {
    skipAuth: true,
  });
  return data;
}
