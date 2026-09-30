"use client"

import { useState } from "react"
import { useQuery } from "@tanstack/react-query"

import { listAuditLogs } from "@/lib/api/audit-logs"
import { PageHeader } from "@/components/page-header"
import { PaginationControls } from "@/components/pagination-controls"
import { Badge } from "@/components/ui/badge"
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
import { useDebouncedValue } from "@/lib/use-debounced-value"

export default function AuditLogsPage() {
  const [page, setPage] = useState(1)
  const [entityType, setEntityType] = useState("")
  const debouncedEntityType = useDebouncedValue(entityType)
  const limit = 20

  const query = useQuery({
    queryKey: ["audit-logs", { page, limit, entityType: debouncedEntityType }],
    queryFn: () =>
      listAuditLogs({ page, limit, entityType: debouncedEntityType || undefined }),
  })

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Auditoría"
        description="Historial de acciones realizadas sobre entidades del sistema."
      />

      <Input
        value={entityType}
        onChange={(event) => {
          setEntityType(event.target.value)
          setPage(1)
        }}
        placeholder="Filtrar por tipo de entidad (ej: Company)..."
        className="sm:w-72"
      />

      <div className="rounded-2xl border border-border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Fecha</TableHead>
              <TableHead>Acción</TableHead>
              <TableHead>Entidad</TableHead>
              <TableHead>Usuario</TableHead>
              <TableHead>IP</TableHead>
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
                  No hay registros de auditoría.
                </TableCell>
              </TableRow>
            )}

            {query.data?.items.map((log) => (
              <TableRow key={log.id}>
                <TableCell className="whitespace-nowrap">
                  {new Date(log.createdAt).toLocaleString("es-CO")}
                </TableCell>
                <TableCell>
                  <Badge variant="outline">{log.action}</Badge>
                </TableCell>
                <TableCell>
                  {log.entityType} <span className="text-muted-foreground">#{log.entityId.slice(0, 8)}</span>
                </TableCell>
                <TableCell>{log.userEmail ?? "—"}</TableCell>
                <TableCell>{log.ipAddress ?? "—"}</TableCell>
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
