"use client"

import { useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"

import { setCompanyStatus, type Company, type CompanyStatus } from "@/lib/api/companies"
import { getErrorMessage } from "@/lib/api/types"
import { StatusBadge } from "@/components/status-badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

const OPTIONS: { value: CompanyStatus; label: string }[] = [
  { value: "ACTIVE", label: "Activar" },
  { value: "SUSPENDED", label: "Suspender" },
  { value: "DELETED", label: "Eliminar (estado)" },
]

export function CompanyStatusCell({ company }: { company: Company }) {
  const queryClient = useQueryClient()

  const mutation = useMutation({
    mutationFn: (status: CompanyStatus) => setCompanyStatus(company.id, status),
    onSuccess: () => {
      toast.success("Estado actualizado")
      queryClient.invalidateQueries({ queryKey: ["companies"] })
      queryClient.invalidateQueries({ queryKey: ["company", company.id] })
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  })

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild onClick={(event) => event.stopPropagation()}>
        <button type="button" className="cursor-pointer">
          <StatusBadge status={company.status} />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" onClick={(event) => event.stopPropagation()}>
        {OPTIONS.filter((option) => option.value !== company.status).map((option) => (
          <DropdownMenuItem key={option.value} onSelect={() => mutation.mutate(option.value)}>
            {option.label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
