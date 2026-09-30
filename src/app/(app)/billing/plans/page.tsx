"use client"

import { useState } from "react"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { Plus } from "lucide-react"

import { activatePlan, deactivatePlan, deletePlan, listPlans, type Plan } from "@/lib/api/billing-plans"
import { getErrorMessage } from "@/lib/api/types"
import { PageHeader } from "@/components/page-header"
import { PaginationControls } from "@/components/pagination-controls"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { PlanFormDialog } from "./_components/plan-form-dialog"

const CYCLE_LABELS: Record<Plan["billingCycle"], string> = {
  MONTHLY: "Mensual",
  QUARTERLY: "Trimestral",
  SEMIANNUAL: "Semestral",
  ANNUAL: "Anual",
}

export default function BillingPlansPage() {
  const [page, setPage] = useState(1)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editing, setEditing] = useState<Plan | undefined>(undefined)
  const queryClient = useQueryClient()
  const limit = 10

  const query = useQuery({
    queryKey: ["billing-plans", { page, limit }],
    queryFn: () => listPlans({ page, limit }),
  })

  function invalidate() {
    queryClient.invalidateQueries({ queryKey: ["billing-plans"] })
  }

  const toggleMutation = useMutation({
    mutationFn: (plan: Plan) => (plan.isActive ? deactivatePlan(plan.id) : activatePlan(plan.id)),
    onSuccess: invalidate,
    onError: (error) => toast.error(getErrorMessage(error)),
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deletePlan(id),
    onSuccess: () => {
      toast.success("Plan eliminado")
      invalidate()
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  })

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Planes de facturación"
        description="Planes disponibles por vertical, usados para crear suscripciones."
        actions={
          <Button
            onClick={() => {
              setEditing(undefined)
              setDialogOpen(true)
            }}
          >
            <Plus className="size-4" />
            Nuevo plan
          </Button>
        }
      />

      <div className="rounded-2xl border border-border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nombre</TableHead>
              <TableHead>Código</TableHead>
              <TableHead>Ciclo</TableHead>
              <TableHead>Precio</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead className="w-48" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {query.isLoading && (
              <TableRow>
                <TableCell colSpan={6}>
                  <Skeleton className="h-5 w-full" />
                </TableCell>
              </TableRow>
            )}

            {query.data?.items.map((plan) => (
              <TableRow key={plan.id}>
                <TableCell className="font-medium">{plan.name}</TableCell>
                <TableCell className="font-mono text-xs">{plan.code}</TableCell>
                <TableCell>{CYCLE_LABELS[plan.billingCycle]}</TableCell>
                <TableCell>
                  {plan.price} {plan.currency}
                </TableCell>
                <TableCell>
                  <Badge variant={plan.isActive ? "success" : "outline"}>
                    {plan.isActive ? "Activo" : "Inactivo"}
                  </Badge>
                </TableCell>
                <TableCell className="flex justify-end gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setEditing(plan)
                      setDialogOpen(true)
                    }}
                  >
                    Editar
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => toggleMutation.mutate(plan)}>
                    {plan.isActive ? "Desactivar" : "Activar"}
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="text-destructive"
                    onClick={() => {
                      if (window.confirm(`¿Eliminar el plan "${plan.name}"?`)) {
                        deleteMutation.mutate(plan.id)
                      }
                    }}
                  >
                    Eliminar
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        <div className="px-4">
          <PaginationControls page={page} limit={limit} total={query.data?.total ?? 0} onPageChange={setPage} />
        </div>
      </div>

      <PlanFormDialog open={dialogOpen} onOpenChange={setDialogOpen} plan={editing} />
    </div>
  )
}
