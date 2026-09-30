"use client"

import { useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"

import { createVertical, updateVertical, type Vertical } from "@/lib/api/verticals"
import { getErrorMessage } from "@/lib/api/types"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { FormField } from "@/components/form-field"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

const verticalSchema = z.object({
  key: z
    .string()
    .min(2)
    .max(40)
    .regex(/^[a-z0-9]+(-[a-z0-9]+)*$/, "Usa minúsculas, números y guiones (ej: mi-vertical)"),
  name: z.string().min(1).max(80),
  description: z.string().max(500).optional().or(z.literal("")),
  marketingPath: z
    .string()
    .min(1)
    .regex(/^\/[a-z0-9-]*$/, "Debe iniciar con / y usar minúsculas/guiones"),
  appBaseUrl: z.string().url("Debe ser una URL válida, incluyendo https://"),
  apiBaseUrl: z.string().url("Debe ser una URL válida").optional().or(z.literal("")),
})

type VerticalFormValues = z.infer<typeof verticalSchema>

export function VerticalFormDialog({
  open,
  onOpenChange,
  vertical,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  vertical?: Vertical
}) {
  const queryClient = useQueryClient()
  const isEdit = Boolean(vertical)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<VerticalFormValues>({ resolver: zodResolver(verticalSchema) })

  useEffect(() => {
    if (open) {
      reset({
        key: vertical?.key ?? "",
        name: vertical?.name ?? "",
        description: vertical?.description ?? "",
        marketingPath: vertical?.marketingPath ?? "/",
        appBaseUrl: vertical?.appBaseUrl ?? "",
        apiBaseUrl: "",
      })
    }
  }, [open, vertical, reset])

  const mutation = useMutation({
    mutationFn: (values: VerticalFormValues) => {
      const dto = {
        key: values.key,
        name: values.name,
        description: values.description || undefined,
        marketingPath: values.marketingPath,
        appBaseUrl: values.appBaseUrl,
        apiBaseUrl: values.apiBaseUrl || undefined,
      }
      return isEdit ? updateVertical(vertical!.id, dto) : createVertical(dto)
    },
    onSuccess: () => {
      toast.success(isEdit ? "Vertical actualizada" : "Vertical creada")
      queryClient.invalidateQueries({ queryKey: ["verticals"] })
      onOpenChange(false)
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  })

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEdit ? "Editar vertical" : "Nueva vertical"}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit((values) => mutation.mutate(values))} className="grid gap-4 sm:grid-cols-2">
          <FormField label="Clave (key)" htmlFor="key" error={errors.key?.message}>
            <Input id="key" placeholder="mi-vertical" disabled={isEdit} {...register("key")} />
          </FormField>

          <FormField label="Nombre" htmlFor="name" error={errors.name?.message}>
            <Input id="name" {...register("name")} />
          </FormField>

          <FormField label="Ruta de marketing" htmlFor="marketingPath" error={errors.marketingPath?.message}>
            <Input id="marketingPath" placeholder="/mi-vertical" {...register("marketingPath")} />
          </FormField>

          <FormField label="URL de la app" htmlFor="appBaseUrl" error={errors.appBaseUrl?.message}>
            <Input id="appBaseUrl" placeholder="https://app.vertical.com" {...register("appBaseUrl")} />
          </FormField>

          <FormField
            label="URL de API (opcional)"
            htmlFor="apiBaseUrl"
            error={errors.apiBaseUrl?.message}
            className="sm:col-span-2"
          >
            <Input id="apiBaseUrl" placeholder="https://api.vertical.com" {...register("apiBaseUrl")} />
          </FormField>

          <FormField label="Descripción" htmlFor="description" error={errors.description?.message} className="sm:col-span-2">
            <Textarea id="description" rows={3} {...register("description")} />
          </FormField>

          <DialogFooter className="sm:col-span-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting || mutation.isPending}>
              {isEdit ? "Guardar cambios" : "Crear vertical"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
