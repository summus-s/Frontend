import { Badge, badgeVariants } from "@/components/ui/badge"
import type { VariantProps } from "class-variance-authority"

type BadgeVariant = VariantProps<typeof badgeVariants>["variant"]

const STATUS_VARIANTS: Record<string, BadgeVariant> = {
  ACTIVE: "success",
  PROVISIONED: "success",
  PAID: "success",
  USED: "success",
  PENDING: "warning",
  PROVISIONING: "warning",
  TRIAL: "warning",
  SUSPENDED: "destructive",
  FAILED: "destructive",
  CANCELED: "destructive",
  DELETED: "destructive",
  REVOKED: "destructive",
  EXPIRED: "destructive",
  DISABLED: "destructive",
  PAST_DUE: "destructive",
};

const STATUS_LABELS: Record<string, string> = {
  ACTIVE: "Activo",
  SUSPENDED: "Suspendido",
  DELETED: "Eliminado",
  DISABLED: "Deshabilitado",
  PENDING: "Pendiente",
  PROVISIONING: "Provisionando",
  PROVISIONED: "Provisionado",
  FAILED: "Fallido",
  CANCELED: "Cancelado",
  USED: "Usado",
  EXPIRED: "Expirado",
  REVOKED: "Revocado",
  TRIAL: "Prueba",
  PAST_DUE: "En mora",
  PAID: "Pagado",
};

export function StatusBadge({ status }: { status: string }) {
  return (
    <Badge variant={STATUS_VARIANTS[status] ?? "outline"}>
      {STATUS_LABELS[status] ?? status}
    </Badge>
  )
}
