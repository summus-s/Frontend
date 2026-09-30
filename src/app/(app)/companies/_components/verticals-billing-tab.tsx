"use client"

import { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { Plus } from "lucide-react"

import { listCompanyVerticals, type CompanyVertical } from "@/lib/api/company-verticals"
import { Button } from "@/components/ui/button"
import { StatusBadge } from "@/components/status-badge"
import { Skeleton } from "@/components/ui/skeleton"
import { AssignVerticalDialog } from "./assign-vertical-dialog"
import { CompanyVerticalDetailDialog } from "./company-vertical-detail-dialog"

export function VerticalsBillingTab({ companyId }: { companyId: string }) {
  const [assignOpen, setAssignOpen] = useState(false)
  const [selected, setSelected] = useState<CompanyVertical | null>(null)

  const query = useQuery({
    queryKey: ["company-verticals", companyId],
    queryFn: () => listCompanyVerticals({ companyId, limit: 50 }),
  })

  return (
    <div className="flex flex-col gap-4">
      <div className="flex justify-end">
        <Button size="sm" onClick={() => setAssignOpen(true)}>
          <Plus className="size-4" />
          Asignar vertical
        </Button>
      </div>

      {query.isLoading && <Skeleton className="h-24 w-full" />}

      {!query.isLoading && query.data?.items.length === 0 && (
        <p className="rounded-2xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
          Esta empresa aún no tiene verticales asignadas.
        </p>
      )}

      <div className="grid gap-3 sm:grid-cols-2">
        {query.data?.items.map((companyVertical) => (
          <button
            key={companyVertical.id}
            onClick={() => setSelected(companyVertical)}
            className="flex flex-col gap-2 rounded-2xl border border-border bg-card p-4 text-left transition-shadow hover:shadow-md"
          >
            <div className="flex items-center justify-between">
              <p className="font-medium">{companyVertical.vertical?.name ?? "Vertical"}</p>
              <StatusBadge status={companyVertical.status} />
            </div>
            <p className="text-xs text-muted-foreground">
              {companyVertical.vertical?.description ?? "Sin descripción"}
            </p>
          </button>
        ))}
      </div>

      <AssignVerticalDialog open={assignOpen} onOpenChange={setAssignOpen} companyId={companyId} />
      <CompanyVerticalDetailDialog
        companyVertical={selected}
        onOpenChange={(open) => !open && setSelected(null)}
      />
    </div>
  )
}
