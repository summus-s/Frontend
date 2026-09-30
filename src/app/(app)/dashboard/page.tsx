"use client"

import Link from "next/link"
import { useQuery } from "@tanstack/react-query"
import { Building2, Layers, Mail } from "lucide-react"

import { useAuth } from "@/lib/auth/auth-context"
import { listCompanies } from "@/lib/api/companies"
import { listInvites } from "@/lib/api/invites"
import { listCompanyVerticals } from "@/lib/api/company-verticals"
import { PageHeader } from "@/components/page-header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

export default function DashboardPage() {
  const { user } = useAuth()

  const companiesQuery = useQuery({
    queryKey: ["companies", { page: 1, limit: 1, status: "ACTIVE" as const }],
    queryFn: () => listCompanies({ page: 1, limit: 1, status: "ACTIVE" }),
  })

  const activeVerticalsQuery = useQuery({
    queryKey: ["company-verticals", { page: 1, limit: 1, status: "ACTIVE" as const }],
    queryFn: () => listCompanyVerticals({ page: 1, limit: 1, status: "ACTIVE" }),
  })

  const pendingInvitesQuery = useQuery({
    queryKey: ["invites", { page: 1, limit: 1, status: "PENDING" as const }],
    queryFn: () => listInvites({ page: 1, limit: 1, status: "PENDING" }),
  })

  const stats = [
    {
      label: "Empresas activas",
      value: companiesQuery.data?.total,
      loading: companiesQuery.isLoading,
      href: "/companies",
      icon: Building2,
    },
    {
      label: "Verticales activas",
      value: activeVerticalsQuery.data?.total,
      loading: activeVerticalsQuery.isLoading,
      href: "/companies",
      icon: Layers,
    },
    {
      label: "Invitaciones pendientes",
      value: pendingInvitesQuery.data?.total,
      loading: pendingInvitesQuery.isLoading,
      href: "/invites",
      icon: Mail,
    },
  ]

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title={`Hola, ${user?.fullName ?? ""}`}
        description="Resumen general de la operación de Summuss."
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {stats.map((stat) => (
          <Link key={stat.label} href={stat.href}>
            <Card className="transition-shadow hover:shadow-md">
              <CardHeader className="flex-row items-center justify-between space-y-0 pb-0">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {stat.label}
                </CardTitle>
                <stat.icon className="size-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                {stat.loading ? (
                  <Skeleton className="h-8 w-16" />
                ) : (
                  <p className="text-3xl font-bold">{stat.value ?? "—"}</p>
                )}
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  )
}
