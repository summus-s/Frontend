"use client"

import { useRouter } from "next/navigation"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { MoreVertical } from "lucide-react"

import {
  deleteCompany,
  setCompanyStatus,
  type Company,
  type CompanyStatus,
} from "@/lib/api/companies"
import { getErrorMessage } from "@/lib/api/types"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export function CompanyStatusMenu({ company }: { company: Company }) {
  const queryClient = useQueryClient()
  const router = useRouter()

  const statusMutation = useMutation({
    mutationFn: (status: CompanyStatus) => setCompanyStatus(company.id, status),
    onSuccess: () => {
      toast.success("Estado actualizado")
      queryClient.invalidateQueries({ queryKey: ["company", company.id] })
      queryClient.invalidateQueries({ queryKey: ["companies"] })
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  })

  const deleteMutation = useMutation({
    mutationFn: () => deleteCompany(company.id),
    onSuccess: () => {
      toast.success("Empresa eliminada")
      queryClient.invalidateQueries({ queryKey: ["companies"] })
      router.replace("/companies")
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  })

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon">
          <MoreVertical className="size-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {company.status !== "ACTIVE" && (
          <DropdownMenuItem onSelect={() => statusMutation.mutate("ACTIVE")}>
            Activar
          </DropdownMenuItem>
        )}
        {company.status !== "SUSPENDED" && (
          <DropdownMenuItem onSelect={() => statusMutation.mutate("SUSPENDED")}>
            Suspender
          </DropdownMenuItem>
        )}
        <DropdownMenuSeparator />
        <DropdownMenuItem
          variant="destructive"
          onSelect={() => {
            if (window.confirm(`¿Eliminar la empresa "${company.name}"?`)) {
              deleteMutation.mutate()
            }
          }}
        >
          Eliminar empresa
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
