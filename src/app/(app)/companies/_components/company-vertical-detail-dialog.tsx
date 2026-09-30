"use client"

import { useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"

import {
  setCompanyVerticalStatus,
  type CompanyVertical,
  type CompanyVerticalStatus,
} from "@/lib/api/company-verticals"
import { getErrorMessage } from "@/lib/api/types"
import { Button } from "@/components/ui/button"
import { StatusBadge } from "@/components/status-badge"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { SubscriptionSection } from "./subscription-section"
import { TenantSection } from "./tenant-section"
import { InvitesSection } from "./invites-section"

export function CompanyVerticalDetailDialog({
  companyVertical,
  onOpenChange,
}: {
  companyVertical: CompanyVertical | null
  onOpenChange: (open: boolean) => void
}) {
  const queryClient = useQueryClient()

  const statusMutation = useMutation({
    mutationFn: (status: CompanyVerticalStatus) => {
      if (!companyVertical) throw new Error("Missing company-vertical")
      return setCompanyVerticalStatus(companyVertical.id, status)
    },
    onSuccess: () => {
      toast.success("Estado actualizado")
      queryClient.invalidateQueries({ queryKey: ["company-verticals"] })
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  })

  return (
    <Dialog open={Boolean(companyVertical)} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl">
        {companyVertical && (
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                {companyVertical.vertical?.name ?? "Vertical"}
                <StatusBadge status={companyVertical.status} />
              </DialogTitle>
            </DialogHeader>

            <div className="flex flex-wrap gap-2">
              {companyVertical.status !== "ACTIVE" && (
                <Button size="sm" variant="outline" onClick={() => statusMutation.mutate("ACTIVE")}>
                  Activar
                </Button>
              )}
              {companyVertical.status !== "SUSPENDED" && (
                <Button size="sm" variant="outline" onClick={() => statusMutation.mutate("SUSPENDED")}>
                  Suspender
                </Button>
              )}
              {companyVertical.status !== "CANCELED" && (
                <Button
                  size="sm"
                  variant="outline"
                  className="text-destructive"
                  onClick={() => statusMutation.mutate("CANCELED")}
                >
                  Cancelar
                </Button>
              )}
            </div>

            <div className="flex flex-col gap-4">
              <SubscriptionSection
                companyVerticalId={companyVertical.id}
                verticalId={companyVertical.verticalId}
              />
              <TenantSection companyVerticalId={companyVertical.id} />
              <InvitesSection companyVerticalId={companyVertical.id} />
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}
