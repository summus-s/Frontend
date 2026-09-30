"use client"

import { use, useState } from "react"
import Link from "next/link"
import { useQuery } from "@tanstack/react-query"
import { ArrowLeft, Pencil } from "lucide-react"

import { getCompany } from "@/lib/api/companies"
import { PageHeader } from "@/components/page-header"
import { StatusBadge } from "@/components/status-badge"
import { Button } from "@/components/ui/button"
import { Spinner } from "@/components/ui/spinner"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CompanyFormDialog } from "../_components/company-form-dialog"
import { CompanyStatusMenu } from "../_components/company-status-menu"
import { ContactsTab } from "../_components/contacts-tab"
import { VerticalsBillingTab } from "../_components/verticals-billing-tab"

export default function CompanyDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = use(params)
  const [editOpen, setEditOpen] = useState(false)

  const query = useQuery({
    queryKey: ["company", id],
    queryFn: () => getCompany(id),
  })

  if (query.isLoading) {
    return (
      <div className="flex flex-1 items-center justify-center py-20">
        <Spinner className="size-6" />
      </div>
    )
  }

  const company = query.data
  if (!company) return null

  return (
    <div className="flex flex-col gap-6">
      <Link href="/companies" className="flex w-fit items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="size-4" />
        Empresas
      </Link>

      <PageHeader
        title={company.name}
        description={company.legalName ?? undefined}
        actions={
          <>
            <StatusBadge status={company.status} />
            <Button variant="outline" size="sm" onClick={() => setEditOpen(true)}>
              <Pencil className="size-4" />
              Editar
            </Button>
            <CompanyStatusMenu company={company} />
          </>
        }
      />

      <dl className="grid gap-4 rounded-2xl border border-border bg-card p-4 text-sm sm:grid-cols-3">
        <div>
          <dt className="text-muted-foreground">NIT / Tax ID</dt>
          <dd>{company.taxId ?? "—"}</dd>
        </div>
        <div>
          <dt className="text-muted-foreground">Correo</dt>
          <dd>{company.email ?? "—"}</dd>
        </div>
        <div>
          <dt className="text-muted-foreground">Teléfono</dt>
          <dd>{company.phone ?? "—"}</dd>
        </div>
        <div>
          <dt className="text-muted-foreground">Ubicación</dt>
          <dd>
            {[company.city, company.country].filter(Boolean).join(", ") || "—"}
          </dd>
        </div>
        <div className="sm:col-span-2">
          <dt className="text-muted-foreground">Dirección</dt>
          <dd>{company.address ?? "—"}</dd>
        </div>
        {company.notes && (
          <div className="sm:col-span-3">
            <dt className="text-muted-foreground">Notas</dt>
            <dd className="whitespace-pre-wrap">{company.notes}</dd>
          </div>
        )}
      </dl>

      <Tabs defaultValue="verticals">
        <TabsList>
          <TabsTrigger value="verticals">Verticales y facturación</TabsTrigger>
          <TabsTrigger value="contacts">Contactos</TabsTrigger>
        </TabsList>
        <TabsContent value="verticals">
          <VerticalsBillingTab companyId={company.id} />
        </TabsContent>
        <TabsContent value="contacts">
          <ContactsTab companyId={company.id} />
        </TabsContent>
      </Tabs>

      <CompanyFormDialog open={editOpen} onOpenChange={setEditOpen} company={company} />
    </div>
  )
}
