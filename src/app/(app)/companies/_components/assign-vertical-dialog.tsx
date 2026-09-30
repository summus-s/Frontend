"use client"

import { useState } from "react"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"

import { createCompanyVertical } from "@/lib/api/company-verticals"
import { listVerticals } from "@/lib/api/verticals"
import { getErrorMessage } from "@/lib/api/types"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { FormField } from "@/components/form-field"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

export function AssignVerticalDialog({
  open,
  onOpenChange,
  companyId,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  companyId: string
}) {
  const [verticalId, setVerticalId] = useState("")
  const [notes, setNotes] = useState("")
  const queryClient = useQueryClient()

  const verticalsQuery = useQuery({
    queryKey: ["verticals", "catalog-active"],
    queryFn: () => listVerticals({ isActive: true, limit: 100 }),
    enabled: open,
  })

  const mutation = useMutation({
    mutationFn: () => createCompanyVertical({ companyId, verticalId, notes: notes || undefined }),
    onSuccess: () => {
      toast.success("Vertical asignada a la empresa")
      queryClient.invalidateQueries({ queryKey: ["company-verticals", companyId] })
      setVerticalId("")
      setNotes("")
      onOpenChange(false)
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  })

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Asignar vertical</DialogTitle>
          <DialogDescription>
            Activa el acceso de esta empresa a una de las verticales del catálogo.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-4">
          <FormField label="Vertical" htmlFor="verticalId">
            <Select value={verticalId} onValueChange={setVerticalId}>
              <SelectTrigger id="verticalId">
                <SelectValue placeholder="Selecciona una vertical" />
              </SelectTrigger>
              <SelectContent>
                {verticalsQuery.data?.items.map((vertical) => (
                  <SelectItem key={vertical.id} value={vertical.id}>
                    {vertical.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FormField>

          <FormField label="Notas" htmlFor="notes">
            <Textarea
              id="notes"
              rows={3}
              value={notes}
              onChange={(event) => setNotes(event.target.value)}
            />
          </FormField>
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button
            type="button"
            disabled={!verticalId || mutation.isPending}
            onClick={() => mutation.mutate()}
          >
            Asignar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
