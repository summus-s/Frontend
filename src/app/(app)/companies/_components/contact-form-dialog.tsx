"use client"

import { useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"

import {
  createCompanyContact,
  updateCompanyContact,
  type CompanyContact,
} from "@/lib/api/company-contacts"
import { getErrorMessage } from "@/lib/api/types"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { FormField } from "@/components/form-field"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

const contactSchema = z.object({
  fullName: z.string().min(1, "El nombre es obligatorio").max(120),
  email: z.string().email("Correo inválido").max(160),
  phone: z.string().max(40).optional().or(z.literal("")),
  isPrimary: z.boolean(),
})

type ContactFormValues = z.infer<typeof contactSchema>

export function ContactFormDialog({
  open,
  onOpenChange,
  companyId,
  contact,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  companyId: string
  contact?: CompanyContact
}) {
  const queryClient = useQueryClient()
  const isEdit = Boolean(contact)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ContactFormValues>({
    resolver: zodResolver(contactSchema),
    defaultValues: { fullName: "", email: "", phone: "", isPrimary: false },
  })

  useEffect(() => {
    if (open) {
      reset({
        fullName: contact?.fullName ?? "",
        email: contact?.email ?? "",
        phone: contact?.phone ?? "",
        isPrimary: contact?.isPrimary ?? false,
      })
    }
  }, [open, contact, reset])

  const mutation = useMutation({
    mutationFn: (values: ContactFormValues) => {
      const payload = {
        fullName: values.fullName,
        email: values.email,
        phone: values.phone || undefined,
        isPrimary: values.isPrimary,
      }
      return isEdit
        ? updateCompanyContact(contact!.id, payload)
        : createCompanyContact({ ...payload, companyId })
    },
    onSuccess: () => {
      toast.success(isEdit ? "Contacto actualizado" : "Contacto agregado")
      queryClient.invalidateQueries({ queryKey: ["company-contacts", companyId] })
      onOpenChange(false)
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  })

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEdit ? "Editar contacto" : "Nuevo contacto"}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit((values) => mutation.mutate(values))} className="flex flex-col gap-4">
          <FormField label="Nombre" htmlFor="fullName" error={errors.fullName?.message}>
            <Input id="fullName" {...register("fullName")} />
          </FormField>

          <FormField label="Correo" htmlFor="email" error={errors.email?.message}>
            <Input id="email" type="email" {...register("email")} />
          </FormField>

          <FormField label="Teléfono" htmlFor="phone" error={errors.phone?.message}>
            <Input id="phone" {...register("phone")} />
          </FormField>

          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" className="size-4 rounded border-input" {...register("isPrimary")} />
            Contacto principal
          </label>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting || mutation.isPending}>
              {isEdit ? "Guardar" : "Agregar"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
