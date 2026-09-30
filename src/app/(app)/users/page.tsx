"use client"

import { useState } from "react"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { Plus } from "lucide-react"

import { deletePlatformUser, listPlatformUsers, setPlatformUserStatus, type PlatformUser } from "@/lib/api/platform-users"
import { getErrorMessage } from "@/lib/api/types"
import { useAuth } from "@/lib/auth/auth-context"
import { useDebouncedValue } from "@/lib/use-debounced-value"
import { PageHeader } from "@/components/page-header"
import { StatusBadge } from "@/components/status-badge"
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
import { UserFormDialog } from "./_components/user-form-dialog"

export default function PlatformUsersPage() {
  const [search, setSearch] = useState("")
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editing, setEditing] = useState<PlatformUser | undefined>(undefined)
  const debouncedSearch = useDebouncedValue(search)
  const queryClient = useQueryClient()
  const { user: currentUser } = useAuth()

  const query = useQuery({
    queryKey: ["platform-users", { search: debouncedSearch }],
    queryFn: () => listPlatformUsers({ search: debouncedSearch || undefined }),
  })

  function invalidate() {
    queryClient.invalidateQueries({ queryKey: ["platform-users"] })
  }

  const statusMutation = useMutation({
    mutationFn: (user: PlatformUser) =>
      setPlatformUserStatus(user.id, user.status === "ACTIVE" ? "DISABLED" : "ACTIVE"),
    onSuccess: invalidate,
    onError: (error) => toast.error(getErrorMessage(error)),
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deletePlatformUser(id),
    onSuccess: () => {
      toast.success("Usuario eliminado")
      invalidate()
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  })

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Usuarios internos"
        description="Equipo de Summuss con acceso al panel administrativo."
        actions={
          <Button
            onClick={() => {
              setEditing(undefined)
              setDialogOpen(true)
            }}
          >
            <Plus className="size-4" />
            Nuevo usuario
          </Button>
        }
      />

      <Input
        value={search}
        onChange={(event) => setSearch(event.target.value)}
        placeholder="Buscar por nombre o correo..."
        className="sm:w-72"
      />

      <div className="rounded-2xl border border-border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nombre</TableHead>
              <TableHead>Correo</TableHead>
              <TableHead>Roles</TableHead>
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

            {query.data?.map((user) => (
              <TableRow key={user.id}>
                <TableCell className="font-medium">{user.fullName}</TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>
                  <div className="flex flex-wrap gap-1">
                    {user.platformUserRoles
                      .filter((role) => role.isActive)
                      .map((role) => (
                        <Badge key={role.id} variant="outline">
                          {role.platformRole?.key}
                        </Badge>
                      ))}
                  </div>
                </TableCell>
                <TableCell>
                  <StatusBadge status={user.status} />
                </TableCell>
                <TableCell className="flex justify-end gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setEditing(user)
                      setDialogOpen(true)
                    }}
                  >
                    Editar
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => statusMutation.mutate(user)}>
                    {user.status === "ACTIVE" ? "Deshabilitar" : "Habilitar"}
                  </Button>
                  {currentUser?.id !== user.id && (
                    <Button
                      size="sm"
                      variant="ghost"
                      className="text-destructive"
                      onClick={() => {
                        if (window.confirm(`¿Eliminar al usuario "${user.fullName}"?`)) {
                          deleteMutation.mutate(user.id)
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
      </div>

      <UserFormDialog open={dialogOpen} onOpenChange={setDialogOpen} user={editing} />
    </div>
  )
}
