"use client"

import { useState } from "react"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"

import { listInvites, resendInvite, revokeInvite, type InviteStatus } from "@/lib/api/invites"
import { getErrorMessage } from "@/lib/api/types"
import { useDebouncedValue } from "@/lib/use-debounced-value"
import { PageHeader } from "@/components/page-header"
import { PaginationControls } from "@/components/pagination-controls"
import { StatusBadge } from "@/components/status-badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
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
import { Skeleton } from "@/components/ui/skeleton"

const STATUS_OPTIONS: { value: InviteStatus | "ALL"; label: string }[] = [
  { value: "ALL", label: "Todos los estados" },
  { value: "PENDING", label: "Pendientes" },
  { value: "USED", label: "Usadas" },
  { value: "EXPIRED", label: "Expiradas" },
  { value: "REVOKED", label: "Revocadas" },
]

export default function InvitesPage() {
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState("")
  const [status, setStatus] = useState<InviteStatus | "ALL">("ALL")
  const debouncedSearch = useDebouncedValue(search)
  const queryClient = useQueryClient()
  const limit = 10

  const query = useQuery({
    queryKey: ["invites", { page, limit, search: debouncedSearch, status }],
    queryFn: () =>
      listInvites({
        page,
        limit,
        search: debouncedSearch || undefined,
        status: status === "ALL" ? undefined : status,
      }),
  })

  function invalidate() {
    queryClient.invalidateQueries({ queryKey: ["invites"] })
  }

  const resendMutation = useMutation({
    mutationFn: (id: string) => resendInvite(id),
    onSuccess: () => {
      toast.success("Invitación reenviada")
      invalidate()
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  })

  const revokeMutation = useMutation({
    mutationFn: (id: string) => revokeInvite(id),
    onSuccess: () => {
      toast.success("Invitación revocada")
      invalidate()
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  })

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Invitaciones"
        description="Invitaciones enviadas a los usuarios finales de cada empresa. Se crean desde el detalle de una empresa y su vertical asignada."
      />

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <Input
          value={search}
          onChange={(event) => {
            setSearch(event.target.value)
            setPage(1)
          }}
          placeholder="Buscar por correo..."
          className="sm:w-72"
        />
        <Select
          value={status}
          onValueChange={(value) => {
            setStatus(value as InviteStatus | "ALL")
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
      </div>

      <div className="rounded-2xl border border-border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Correo</TableHead>
              <TableHead>Nombre</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead className="w-40" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {query.isLoading && (
              <TableRow>
                <TableCell colSpan={4}>
                  <Skeleton className="h-5 w-full" />
                </TableCell>
              </TableRow>
            )}

            {!query.isLoading && query.data?.items.length === 0 && (
              <TableRow>
                <TableCell colSpan={4} className="py-10 text-center text-muted-foreground">
                  No se encontraron invitaciones.
                </TableCell>
              </TableRow>
            )}

            {query.data?.items.map((invite) => (
              <TableRow key={invite.id}>
                <TableCell className="font-medium">{invite.email}</TableCell>
                <TableCell>{invite.fullName ?? "—"}</TableCell>
                <TableCell>
                  <StatusBadge status={invite.status} />
                </TableCell>
                <TableCell className="flex justify-end gap-2">
                  {invite.status === "PENDING" && (
                    <>
                      <Button size="sm" variant="outline" onClick={() => resendMutation.mutate(invite.id)}>
                        Reenviar
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-destructive"
                        onClick={() => revokeMutation.mutate(invite.id)}
                      >
                        Revocar
                      </Button>
                    </>
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
    </div>
  )
}
