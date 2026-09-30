"use client"

import { useState } from "react"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { Plus } from "lucide-react"

import { deletePlatformRole, listPlatformRoles, updatePlatformRole, type PlatformRole } from "@/lib/api/platform-roles"
import { getErrorMessage } from "@/lib/api/types"
import { PageHeader } from "@/components/page-header"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { RoleFormDialog } from "./_components/role-form-dialog"

export default function PlatformRolesPage() {
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editingName, setEditingName] = useState("")
  const queryClient = useQueryClient()

  const query = useQuery({
    queryKey: ["platform-roles"],
    queryFn: () => listPlatformRoles({ limit: 50 }),
  })

  function invalidate() {
    queryClient.invalidateQueries({ queryKey: ["platform-roles"] })
  }

  const updateMutation = useMutation({
    mutationFn: ({ id, name }: { id: string; name: string }) => updatePlatformRole(id, name),
    onSuccess: () => {
      toast.success("Rol actualizado")
      setEditingId(null)
      invalidate()
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deletePlatformRole(id),
    onSuccess: () => {
      toast.success("Rol eliminado")
      invalidate()
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  })

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Roles de la plataforma"
        description="Roles internos usados para controlar el acceso del equipo Summuss."
        actions={
          <Button onClick={() => setDialogOpen(true)}>
            <Plus className="size-4" />
            Nuevo rol
          </Button>
        }
      />

      <div className="rounded-2xl border border-border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Clave</TableHead>
              <TableHead>Nombre</TableHead>
              <TableHead className="w-48" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {query.isLoading && (
              <TableRow>
                <TableCell colSpan={3}>
                  <Skeleton className="h-5 w-full" />
                </TableCell>
              </TableRow>
            )}

            {query.data?.items.map((role: PlatformRole) => (
              <TableRow key={role.id}>
                <TableCell>
                  <Badge variant="outline">{role.key}</Badge>
                </TableCell>
                <TableCell>
                  {editingId === role.id ? (
                    <Input
                      autoFocus
                      value={editingName}
                      onChange={(event) => setEditingName(event.target.value)}
                      onKeyDown={(event) => {
                        if (event.key === "Enter") {
                          updateMutation.mutate({ id: role.id, name: editingName })
                        }
                        if (event.key === "Escape") setEditingId(null)
                      }}
                      className="h-8 max-w-56"
                    />
                  ) : (
                    role.name
                  )}
                </TableCell>
                <TableCell className="flex justify-end gap-2">
                  {editingId === role.id ? (
                    <>
                      <Button
                        size="sm"
                        onClick={() => updateMutation.mutate({ id: role.id, name: editingName })}
                      >
                        Guardar
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => setEditingId(null)}>
                        Cancelar
                      </Button>
                    </>
                  ) : (
                    <>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setEditingId(role.id)
                          setEditingName(role.name)
                        }}
                      >
                        Editar
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-destructive"
                        onClick={() => {
                          if (window.confirm(`¿Eliminar el rol "${role.name}"?`)) {
                            deleteMutation.mutate(role.id)
                          }
                        }}
                      >
                        Eliminar
                      </Button>
                    </>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <RoleFormDialog open={dialogOpen} onOpenChange={setDialogOpen} />
    </div>
  )
}
