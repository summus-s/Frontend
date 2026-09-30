"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { Pencil, Plus, Search, Trash2 } from "lucide-react"

import { deleteCompany, listCompanies, type Company, type CompanyStatus } from "@/lib/api/companies"
import { getErrorMessage } from "@/lib/api/types"
import { useDebouncedValue } from "@/lib/use-debounced-value"
import { PageHeader } from "@/components/page-header"
import { PaginationControls } from "@/components/pagination-controls"
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
import { CompanyFormDialog } from "./_components/company-form-dialog"
import { CompanyStatusCell } from "./_components/company-status-cell"

const STATUS_OPTIONS: { value: CompanyStatus | "ALL"; label: string }[] = [
  { value: "ALL", label: "Todos los estados" },
  { value: "ACTIVE", label: "Activas" },
  { value: "SUSPENDED", label: "Suspendidas" },
  { value: "DELETED", label: "Eliminadas" },
]

export default function CompaniesPage() {
  const router = useRouter()
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState("")
  const [status, setStatus] = useState<CompanyStatus | "ALL">("ALL")
  const [createOpen, setCreateOpen] = useState(false)
  const [editing, setEditing] = useState<Company | undefined>(undefined)
  const debouncedSearch = useDebouncedValue(search)
  const queryClient = useQueryClient()
  const limit = 10

  const query = useQuery({
    queryKey: ["companies", { page, limit, search: debouncedSearch, status }],
    queryFn: () =>
      listCompanies({
        page,
        limit,
        search: debouncedSearch || undefined,
        status: status === "ALL" ? undefined : status,
      }),
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteCompany(id),
    onSuccess: () => {
      toast.success("Empresa eliminada")
      queryClient.invalidateQueries({ queryKey: ["companies"] })
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  })

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Empresas"
        description="Empresas cliente registradas en la plataforma."
        actions={
          <Button
            onClick={() => {
              setEditing(undefined)
              setCreateOpen(true)
            }}
          >
            <Plus className="size-4" />
            Nueva empresa
          </Button>
        }
      />

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative sm:w-72">
          <Search className="absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(event) => {
              setSearch(event.target.value)
              setPage(1)
            }}
            placeholder="Buscar por nombre o NIT..."
            className="pl-8"
          />
        </div>

        <Select
          value={status}
          onValueChange={(value) => {
            setStatus(value as CompanyStatus | "ALL")
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
              <TableHead>Nombre</TableHead>
              <TableHead>NIT</TableHead>
              <TableHead>Contacto</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead>Creada</TableHead>
              <TableHead className="w-24" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {query.isLoading &&
              Array.from({ length: 5 }).map((_, index) => (
                <TableRow key={index}>
                  <TableCell colSpan={6}>
                    <Skeleton className="h-5 w-full" />
                  </TableCell>
                </TableRow>
              ))}

            {!query.isLoading && query.data?.items.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="py-10 text-center text-muted-foreground">
                  No se encontraron empresas.
                </TableCell>
              </TableRow>
            )}

            {query.data?.items.map((company) => (
              <TableRow
                key={company.id}
                className="cursor-pointer"
                onClick={() => router.push(`/companies/${company.id}`)}
              >
                <TableCell className="font-medium">{company.name}</TableCell>
                <TableCell>{company.taxId ?? "—"}</TableCell>
                <TableCell>{company.email ?? "—"}</TableCell>
                <TableCell>
                  <CompanyStatusCell company={company} />
                </TableCell>
                <TableCell>{new Date(company.createdAt).toLocaleDateString("es-CO")}</TableCell>
                <TableCell>
                  <div className="flex justify-end gap-1">
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      title="Editar"
                      onClick={(event) => {
                        event.stopPropagation()
                        setEditing(company)
                        setCreateOpen(true)
                      }}
                    >
                      <Pencil className="size-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      title="Eliminar"
                      onClick={(event) => {
                        event.stopPropagation()
                        if (window.confirm(`¿Eliminar la empresa "${company.name}"?`)) {
                          deleteMutation.mutate(company.id)
                        }
                      }}
                    >
                      <Trash2 className="size-4 text-destructive" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        <div className="px-4">
          <PaginationControls
            page={page}
            limit={limit}
            total={query.data?.total ?? 0}
            onPageChange={setPage}
          />
        </div>
      </div>

      <CompanyFormDialog open={createOpen} onOpenChange={setCreateOpen} company={editing} />
    </div>
  )
}
