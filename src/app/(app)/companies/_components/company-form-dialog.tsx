"use client"

import { useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"

import {
  createCompany,
  updateCompany,
  type Company,
} from "@/lib/api/companies"
import { getErrorMessage } from "@/lib/api/types"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { FormField } from "@/components/form-field"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

const companySchema = z.object({
  name: z.string().min(1, "El nombre es obligatorio").max(120),
  legalName: z.string().max(160).optional().or(z.literal("")),
  taxId: z.string().max(60).optional().or(z.literal("")),
  email: z.string().email("Correo inválido").optional().or(z.literal("")),
  phone: z.string().max(40).optional().or(z.literal("")),
  country: z.string().max(80).optional().or(z.literal("")),
  city: z.string().max(80).optional().or(z.literal("")),
  address: z.string().max(200).optional().or(z.literal("")),
  notes: z.string().max(1000).optional().or(z.literal("")),
})

type CompanyFormValues = z.infer<typeof companySchema>

export function CompanyFormDialog({
  open,
  onOpenChange,
  company,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  company?: Company
}) {
  const queryClient = useQueryClient()
  const isEdit = Boolean(company)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<CompanyFormValues>({
    resolver: zodResolver(companySchema),
    defaultValues: { name: "" },
  })

  useEffect(() => {
    if (open) {
      reset({
        name: company?.name ?? "",
        legalName: company?.legalName ?? "",
        taxId: company?.taxId ?? "",
        email: company?.email ?? "",
        phone: company?.phone ?? "",
        country: company?.country ?? "",
        city: company?.city ?? "",
        address: company?.address ?? "",
        notes: company?.notes ?? "",
      })
    }
  }, [open, company, reset])

  const mutation = useMutation({
    mutationFn: (values: CompanyFormValues) => {
      const dto = {
        name: values.name,
        legalName: values.legalName || undefined,
        taxId: values.taxId || undefined,
        email: values.email || undefined,
        phone: values.phone || undefined,
        country: values.country || undefined,
        city: values.city || undefined,
        address: values.address || undefined,
        notes: values.notes || undefined,
      }
      return isEdit ? updateCompany(company!.id, dto) : createCompany(dto)
    },
    onSuccess: () => {
      toast.success(isEdit ? "Empresa actualizada" : "Empresa creada")
      queryClient.invalidateQueries({ queryKey: ["companies"] })
      if (isEdit) queryClient.invalidateQueries({ queryKey: ["company", company!.id] })
      onOpenChange(false)
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  })

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEdit ? "Editar empresa" : "Nueva empresa"}</DialogTitle>
          <DialogDescription>
            {isEdit
              ? "Actualiza los datos de la empresa."
              : "Registra una nueva empresa cliente en la plataforma."}
          </DialogDescription>
        </DialogHeader>

        <form
          onSubmit={handleSubmit((values) => mutation.mutate(values))}
          className="grid gap-4 sm:grid-cols-2"
        >
          <FormField label="Nombre comercial" htmlFor="name" error={errors.name?.message} className="sm:col-span-2">
            <Input id="name" {...register("name")} />
          </FormField>

          <FormField label="Razón social" htmlFor="legalName" error={errors.legalName?.message}>
            <Input id="legalName" {...register("legalName")} />
          </FormField>

          <FormField label="NIT / Tax ID" htmlFor="taxId" error={errors.taxId?.message}>
            <Input id="taxId" {...register("taxId")} />
          </FormField>

          <FormField label="Correo" htmlFor="email" error={errors.email?.message}>
            <Input id="email" type="email" {...register("email")} />
          </FormField>

          <FormField label="Teléfono" htmlFor="phone" error={errors.phone?.message}>
            <Input id="phone" {...register("phone")} />
          </FormField>

          <FormField label="País" htmlFor="country" error={errors.country?.message}>
            <Input id="country" {...register("country")} />
          </FormField>

          <FormField label="Ciudad" htmlFor="city" error={errors.city?.message}>
            <Input id="city" {...register("city")} />
          </FormField>

          <FormField label="Dirección" htmlFor="address" error={errors.address?.message} className="sm:col-span-2">
            <Input id="address" {...register("address")} />
          </FormField>

          <FormField label="Notas" htmlFor="notes" error={errors.notes?.message} className="sm:col-span-2">
            <Textarea id="notes" rows={3} {...register("notes")} />
          </FormField>

          <DialogFooter className="sm:col-span-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting || mutation.isPending}>
              {isEdit ? "Guardar cambios" : "Crear empresa"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
