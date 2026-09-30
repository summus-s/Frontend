"use client"

import { useState } from "react"
import Link from "next/link"
import { useQuery } from "@tanstack/react-query"
import { Plus, Search } from "lucide-react"

import { listCompanies, type CompanyStatus } from "@/lib/api/companies"
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
import { CompanyFormDialog } from "./_components/company-form-dialog"

const STATUS_OPTIONS: { value: CompanyStatus | "ALL"; label: string }[] = [
  { value: "ALL", label: "Todos los estados" },
  { value: "ACTIVE", label: "Activas" },
  { value: "SUSPENDED", label: "Suspendidas" },
  { value: "DELETED", label: "Eliminadas" },
]

export default function CompaniesPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<CompanyStatus | "ALL">("ALL");
  const [createOpen, setCreateOpen] = useState(false);
  const debouncedSearch = useDebouncedValue(search);
  const limit = 10;

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

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Empresas"
        description="Empresas cliente registradas en la plataforma."
        actions={
          <Button onClick={() => setCreateOpen(true)}>
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
            </TableRow>
          </TableHeader>
          <TableBody>
            {query.isLoading &&
              Array.from({ length: 5 }).map((_, index) => (
                <TableRow key={index}>
                  <TableCell colSpan={5}>
                    <Skeleton className="h-5 w-full" />
                  </TableCell>
                </TableRow>
              ))}

            {!query.isLoading && query.data?.items.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="py-10 text-center text-muted-foreground">
                  No se encontraron empresas.
                </TableCell>
              </TableRow>
            )}

            {query.data?.items.map((company) => (
              <TableRow key={company.id} className="cursor-pointer">
                <TableCell className="font-medium">
                  <Link href={`/companies/${company.id}`} className="hover:underline">
                    {company.name}
                  </Link>
                </TableCell>
                <TableCell>{company.taxId ?? "—"}</TableCell>
                <TableCell>{company.email ?? "—"}</TableCell>
                <TableCell>
                  <StatusBadge status={company.status} />
                </TableCell>
                <TableCell>{new Date(company.createdAt).toLocaleDateString("es-CO")}</TableCell>
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

      <CompanyFormDialog open={createOpen} onOpenChange={setCreateOpen} />
    </div>
  )
}
