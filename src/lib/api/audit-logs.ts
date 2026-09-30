import { apiClient } from "@/lib/api/http";
import type { Paginated, PaginationQuery } from "@/lib/api/types";

export type AuditLogAction =
  | "CREATE"
  | "UPDATE"
  | "DELETE"
  | "ACTIVATE"
  | "DEACTIVATE"
  | "LOGIN"
  | "LOGOUT"
  | "INVITE_CREATE"
  | "INVITE_ACCEPT"
  | "ROLE_ASSIGN"
  | "ROLE_REVOKE"
  | "SUBSCRIPTION_CREATE"
  | "SUBSCRIPTION_CANCEL"
  | "ORDER_CREATE"
  | "ORDER_PAID"
  | "ORDER_FAILED"
  | "PROVISIONING_START"
  | "PROVISIONING_SUCCESS"
  | "PROVISIONING_FAILED";

export interface AuditLog {
  id: string;
  actorUserId: string | null;
  action: AuditLogAction;
  entityType: string;
  entityId: string;
  metadata: Record<string, unknown> | null;
  userEmail: string | null;
  ipAddress: string | null;
  userAgent: string | null;
  notes: string | null;
  createdAt: string;
}

export interface QueryAuditLogsDto extends PaginationQuery {
  actorUserId?: string;
  action?: string;
  entityType?: string;
  entityId?: string;
}

export async function listAuditLogs(
  query: QueryAuditLogsDto = {},
): Promise<Paginated<AuditLog>> {
  const { data } = await apiClient.get<Paginated<AuditLog>>("/audit-logs", {
    params: query,
  });
  return data;
}

export async function getAuditLog(id: string): Promise<AuditLog> {
  const { data } = await apiClient.get<AuditLog>(`/audit-logs/${id}`);
  return data;
}
