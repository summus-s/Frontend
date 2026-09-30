import { apiClient } from "@/lib/api/http";
import type { Paginated, PaginationQuery } from "@/lib/api/types";

export interface Vertical {
  id: string;
  key: string;
  name: string;
  description: string | null;
  isActive: boolean;
  marketingPath: string;
  appBaseUrl: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateVerticalDto {
  key: string;
  name: string;
  description?: string;
  isActive?: boolean;
  marketingPath: string;
  appBaseUrl: string;
  apiBaseUrl?: string;
  provisioningApiKey?: string;
}

export type UpdateVerticalDto = Partial<CreateVerticalDto>;

export interface QueryVerticalsDto extends PaginationQuery {
  search?: string;
  isActive?: boolean;
}

export async function listVerticals(
  query: QueryVerticalsDto = {},
): Promise<Paginated<Vertical>> {
  const { data } = await apiClient.get<Paginated<Vertical>>("/verticals", {
    params: query,
  });
  return data;
}

export async function getVertical(id: string): Promise<Vertical> {
  const { data } = await apiClient.get<Vertical>(`/verticals/${id}`);
  return data;
}

export async function createVertical(dto: CreateVerticalDto): Promise<Vertical> {
  const { data } = await apiClient.post<Vertical>("/verticals", dto);
  return data;
}

export async function updateVertical(
  id: string,
  dto: UpdateVerticalDto,
): Promise<Vertical> {
  const { data } = await apiClient.patch<Vertical>(`/verticals/${id}`, dto);
  return data;
}

export async function activateVertical(id: string): Promise<Vertical> {
  const { data } = await apiClient.patch<Vertical>(`/verticals/${id}/activate`);
  return data;
}

export async function deactivateVertical(id: string): Promise<Vertical> {
  const { data } = await apiClient.patch<Vertical>(`/verticals/${id}/deactivate`);
  return data;
}

export async function deleteVertical(id: string): Promise<void> {
  await apiClient.delete(`/verticals/${id}`);
}
