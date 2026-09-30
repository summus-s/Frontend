"use client"

import { useState } from "react"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { Plus } from "lucide-react"

import { deleteOrder, listOrders, updateOrder, type Order, type OrderStatus } from "@/lib/api/billing-orders"
import { createOrderCheckout } from "@/lib/api/mercadopago"
import { getErrorMessage } from "@/lib/api/types"
import { PageHeader } from "@/components/page-header"
import { PaginationControls } from "@/components/pagination-controls"
import { StatusBadge } from "@/components/status-badge"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { OrderFormDialog } from "./_components/order-form-dialog"

const STATUS_OPTIONS: { value: OrderStatus | "ALL"; label: string }[] = [
  { value: "ALL", label: "Todos los estados" },
  { value: "PENDING", label: "Pendientes" },
  { value: "PAID", label: "Pagadas" },
  { value: "FAILED", label: "Fallidas" },
  { value: "CANCELED", label: "Canceladas" },
]

export default function BillingOrdersPage() {
  const [page, setPage] = useState(1)
  const [status, setStatus] = useState<OrderStatus | "ALL">("ALL")
  const [dialogOpen, setDialogOpen] = useState(false)
  const queryClient = useQueryClient()
  const limit = 10

  const query = useQuery({
    queryKey: ["billing-orders", { page, limit, status }],
    queryFn: () => listOrders({ page, limit, status: status === "ALL" ? undefined : status }),
  })

  function invalidate() {
    queryClient.invalidateQueries({ queryKey: ["billing-orders"] })
  }

  const markPaidMutation = useMutation({
    mutationFn: (order: Order) => updateOrder(order.id, { status: "PAID" }),
    onSuccess: () => {
      toast.success("Orden marcada como pagada")
      invalidate()
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  })

  const cancelMutation = useMutation({
    mutationFn: (order: Order) => updateOrder(order.id, { status: "CANCELED" }),
    onSuccess: () => {
      toast.success("Orden cancelada")
      invalidate()
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  })

  const checkoutMutation = useMutation({
    mutationFn: (order: Order) => createOrderCheckout(order.id),
    onSuccess: (result) => {
      window.open(result.checkoutUrl, "_blank", "noopener,noreferrer")
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteOrder(id),
    onSuccess: () => {
      toast.success("Orden eliminada")
      invalidate()
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  })

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Órdenes de facturación"
        description="Cobros asociados a suscripciones y planes de cada empresa."
        actions={
          <Button onClick={() => setDialogOpen(true)}>
            <Plus className="size-4" />
            Nueva orden
          </Button>
        }
      />

      <Select
        value={status}
        onValueChange={(value) => {
          setStatus(value as OrderStatus | "ALL")
          setPage(1)
        }}
      >
        <SelectTrigger className="sm:w-48">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {STATUS_OPTIONS.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <div className="rounded-2xl border border-border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Monto</TableHead>
              <TableHead>Proveedor</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead>Creada</TableHead>
              <TableHead className="w-56" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {query.isLoading && (
              <TableRow>
                <TableCell colSpan={5}>
                  <Skeleton className="h-5 w-full" />
                </TableCell>
              </TableRow>
            )}

            {!query.isLoading && query.data?.items.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="py-10 text-center text-muted-foreground">
                  No hay órdenes registradas.
                </TableCell>
              </TableRow>
            )}

            {query.data?.items.map((order) => (
              <TableRow key={order.id}>
                <TableCell className="font-medium">
                  {order.totalAmount} {order.currency}
                </TableCell>
                <TableCell>{order.provider}</TableCell>
                <TableCell>
                  <StatusBadge status={order.status} />
                </TableCell>
                <TableCell>{new Date(order.createdAt).toLocaleDateString("es-CO")}</TableCell>
                <TableCell className="flex justify-end gap-2">
                  {order.status === "PENDING" && order.provider === "MERCADOPAGO" && (
                    <Button size="sm" variant="outline" onClick={() => checkoutMutation.mutate(order)}>
                      Checkout MP
                    </Button>
                  )}
                  {order.status === "PENDING" && (
                    <>
                      <Button size="sm" variant="outline" onClick={() => markPaidMutation.mutate(order)}>
                        Marcar pagada
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => cancelMutation.mutate(order)}>
                        Cancelar
                      </Button>
                    </>
                  )}
                  {order.status !== "PAID" && (
                    <Button
                      size="sm"
                      variant="ghost"
                      className="text-destructive"
                      onClick={() => {
                        if (window.confirm("¿Eliminar esta orden?")) {
                          deleteMutation.mutate(order.id)
                        }
                      }}
                    >
                      Eliminar
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        <div className="px-4">
          <PaginationControls page={page} limit={limit} total={query.data?.total ?? 0} onPageChange={setPage} />
        </div>
      </div>

      <OrderFormDialog open={dialogOpen} onOpenChange={setDialogOpen} />
    </div>
  )
}
