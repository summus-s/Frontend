"use client"

import { useEffect } from "react"
import { useForm, Controller } from "react-hook-form"
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
import { DOCUMENT_TYPES, DOCUMENT_TYPE_LABELS } from "@/lib/document-types"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { FormField } from "@/components/form-field"
import { CountryCityFields } from "@/components/country-city-fields"
import { AddressFields } from "@/components/address-fields"
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

const companySchema = z.object({
  name: z.string().min(1, "El nombre es obligatorio").max(120),
  legalName: z.string().max(160).optional().or(z.literal("")),
  documentType: z.enum(DOCUMENT_TYPES).optional().or(z.literal("")),
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
    control,
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
        documentType: company?.documentType ?? "",
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
        documentType: values.documentType || undefined,
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

          <FormField label="Tipo de documento" htmlFor="documentType">
            <Controller
              control={control}
              name="documentType"
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger id="documentType">
                    <SelectValue placeholder="Selecciona un tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    {DOCUMENT_TYPES.map((type) => (
                      <SelectItem key={type} value={type}>
                        {DOCUMENT_TYPE_LABELS[type]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          </FormField>

          <FormField label="Número de documento" htmlFor="taxId" error={errors.taxId?.message}>
            <Input id="taxId" {...register("taxId")} />
          </FormField>

          <FormField label="Correo" htmlFor="email" error={errors.email?.message}>
            <Input id="email" type="email" {...register("email")} />
          </FormField>

          <FormField label="Teléfono" htmlFor="phone" error={errors.phone?.message}>
            <Input id="phone" {...register("phone")} />
          </FormField>

          <Controller
            control={control}
            name="country"
            render={({ field: countryField }) => (
              <Controller
                control={control}
                name="city"
                render={({ field: cityField }) => (
                  <CountryCityFields
                    country={countryField.value ?? ""}
                    city={cityField.value ?? ""}
                    onCountryChange={countryField.onChange}
                    onCityChange={cityField.onChange}
                  />
                )}
              />
            )}
          />

          <Controller
            control={control}
            name="address"
            render={({ field }) => (
              <AddressFields value={field.value ?? ""} onChange={field.onChange} />
            )}
          />

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
