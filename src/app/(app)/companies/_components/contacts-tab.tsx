"use client"

import { useState } from "react"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { Plus, Star, Trash2 } from "lucide-react"

import {
  deleteCompanyContact,
  listCompanyContacts,
  type CompanyContact,
} from "@/lib/api/company-contacts"
import { getErrorMessage } from "@/lib/api/types"
import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Skeleton } from "@/components/ui/skeleton"
import { ContactFormDialog } from "./contact-form-dialog"

export function ContactsTab({ companyId }: { companyId: string }) {
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editing, setEditing] = useState<CompanyContact | undefined>(undefined)
  const queryClient = useQueryClient()

  const query = useQuery({
    queryKey: ["company-contacts", companyId],
    queryFn: () => listCompanyContacts({ companyId, limit: 100 }),
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteCompanyContact(id),
    onSuccess: () => {
      toast.success("Contacto eliminado")
      queryClient.invalidateQueries({ queryKey: ["company-contacts", companyId] })
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  })

  return (
    <div className="flex flex-col gap-4">
      <div className="flex justify-end">
        <Button
          size="sm"
          onClick={() => {
            setEditing(undefined)
            setDialogOpen(true)
          }}
        >
          <Plus className="size-4" />
          Nuevo contacto
        </Button>
      </div>

      <div className="rounded-2xl border border-border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nombre</TableHead>
              <TableHead>Correo</TableHead>
              <TableHead>Teléfono</TableHead>
              <TableHead className="w-24" />
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
                <TableCell colSpan={4} className="py-8 text-center text-muted-foreground">
                  Aún no hay contactos registrados.
                </TableCell>
              </TableRow>
            )}

            {query.data?.items.map((contact) => (
              <TableRow
                key={contact.id}
                className="cursor-pointer"
                onClick={() => {
                  setEditing(contact)
                  setDialogOpen(true)
                }}
              >
                <TableCell className="font-medium">
                  <span className="flex items-center gap-1.5">
                    {contact.isPrimary && <Star className="size-3.5 fill-amber-400 text-amber-400" />}
                    {contact.fullName}
                  </span>
                </TableCell>
                <TableCell>{contact.email}</TableCell>
                <TableCell>{contact.phone ?? "—"}</TableCell>
                <TableCell>
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    onClick={(event) => {
                      event.stopPropagation()
                      if (window.confirm(`¿Eliminar el contacto "${contact.fullName}"?`)) {
                        deleteMutation.mutate(contact.id)
                      }
                    }}
                  >
                    <Trash2 className="size-4 text-destructive" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <ContactFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        companyId={companyId}
        contact={editing}
      />
    </div>
  )
}
