"use client"

import { useState } from "react"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { Plus } from "lucide-react"

import { activateVertical, deactivateVertical, deleteVertical, listVerticals, type Vertical } from "@/lib/api/verticals"
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
import { VerticalFormDialog } from "./_components/vertical-form-dialog"

export default function VerticalsPage() {
  const [page, setPage] = useState(1)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editing, setEditing] = useState<Vertical | undefined>(undefined)
  const queryClient = useQueryClient()
  const limit = 10

  const query = useQuery({
    queryKey: ["verticals", { page, limit }],
    queryFn: () => listVerticals({ page, limit }),
  })

  function invalidate() {
    queryClient.invalidateQueries({ queryKey: ["verticals"] })
  }

  const toggleMutation = useMutation({
    mutationFn: (vertical: Vertical) =>
      vertical.isActive ? deactivateVertical(vertical.id) : activateVertical(vertical.id),
    onSuccess: invalidate,
    onError: (error) => toast.error(getErrorMessage(error)),
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteVertical(id),
    onSuccess: () => {
      toast.success("Vertical eliminada")
      invalidate()
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  })

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Verticales"
        description="Catálogo de productos verticales disponibles para las empresas."
        actions={
          <Button
            onClick={() => {
              setEditing(undefined)
              setDialogOpen(true)
            }}
          >
            <Plus className="size-4" />
            Nueva vertical
          </Button>
        }
      />

      <div className="rounded-2xl border border-border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nombre</TableHead>
              <TableHead>Clave</TableHead>
              <TableHead>App URL</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead className="w-48" />
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

            {query.data?.items.map((vertical) => (
              <TableRow key={vertical.id}>
                <TableCell className="font-medium">{vertical.name}</TableCell>
                <TableCell className="font-mono text-xs">{vertical.key}</TableCell>
                <TableCell className="max-w-64 truncate">{vertical.appBaseUrl}</TableCell>
                <TableCell>
                  <Badge variant={vertical.isActive ? "success" : "outline"}>
                    {vertical.isActive ? "Activa" : "Inactiva"}
                  </Badge>
                </TableCell>
                <TableCell className="flex justify-end gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setEditing(vertical)
                      setDialogOpen(true)
                    }}
                  >
                    Editar
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => toggleMutation.mutate(vertical)}>
                    {vertical.isActive ? "Desactivar" : "Activar"}
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="text-destructive"
                    onClick={() => {
                      if (window.confirm(`¿Eliminar la vertical "${vertical.name}"?`)) {
                        deleteMutation.mutate(vertical.id)
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

      <VerticalFormDialog open={dialogOpen} onOpenChange={setDialogOpen} vertical={editing} />
    </div>
  )
}
