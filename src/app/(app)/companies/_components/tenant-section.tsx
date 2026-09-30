"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"

import { createVerticalTenant, listVerticalTenants, startProvisioning } from "@/lib/api/vertical-tenants"
import { provisionVerticalTenant } from "@/lib/api/provisioning"
import { getErrorMessage } from "@/lib/api/types"
import { Button } from "@/components/ui/button"
import { StatusBadge } from "@/components/status-badge"

export function TenantSection({ companyVerticalId }: { companyVerticalId: string }) {
  const queryClient = useQueryClient()

  const tenantQuery = useQuery({
    queryKey: ["vertical-tenants", companyVerticalId],
    queryFn: () => listVerticalTenants({ companyVerticalId, limit: 1 }),
  })

  const tenant = tenantQuery.data?.items[0]

  function invalidate() {
    queryClient.invalidateQueries({ queryKey: ["vertical-tenants", companyVerticalId] })
  }

  const createMutation = useMutation({
    mutationFn: () => createVerticalTenant({ companyVerticalId }),
    onSuccess: () => {
      toast.success("Tenant creado")
      invalidate()
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  })

  const startMutation = useMutation({
    mutationFn: () => startProvisioning(tenant!.id),
    onSuccess: () => {
      toast.success("Provisioning iniciado")
      invalidate()
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  })

  const provisionMutation = useMutation({
    mutationFn: () => provisionVerticalTenant(tenant!.id),
    onSuccess: () => {
      toast.success("Tenant provisionado")
      invalidate()
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  })

  if (tenantQuery.isLoading) return null

  return (
    <section className="rounded-xl border border-border p-4">
      <h3 className="text-sm font-semibold">Tenant / Provisioning</h3>

      {tenant ? (
        <div className="mt-3 flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <StatusBadge status={tenant.status} />
            {tenant.externalUrl && (
              <a
                href={tenant.externalUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-primary hover:underline"
              >
                {tenant.externalUrl}
              </a>
            )}
          </div>
          {tenant.lastErrorMessage && (
            <p className="text-xs text-destructive">{tenant.lastErrorMessage}</p>
          )}

          <div className="flex gap-2">
            {tenant.status === "PENDING" && (
              <Button size="sm" variant="outline" disabled={startMutation.isPending} onClick={() => startMutation.mutate()}>
                Iniciar provisioning
              </Button>
            )}
            {(tenant.status === "PENDING" || tenant.status === "PROVISIONING" || tenant.status === "FAILED") && (
              <Button size="sm" disabled={provisionMutation.isPending} onClick={() => provisionMutation.mutate()}>
                Provisionar ahora
              </Button>
            )}
          </div>
        </div>
      ) : (
        <div className="mt-3 flex flex-col gap-2">
          <p className="text-sm text-muted-foreground">Esta vertical aún no tiene tenant creado.</p>
          <Button size="sm" className="w-fit" disabled={createMutation.isPending} onClick={() => createMutation.mutate()}>
            Crear tenant
          </Button>
        </div>
      )}
    </section>
  )
}
