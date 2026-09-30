"use client"

import { useEffect } from "react"
import { useForm, useWatch, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"

import { createPlan, updatePlan, type Plan } from "@/lib/api/billing-plans"
import { listVerticals } from "@/lib/api/verticals"
import { getErrorMessage } from "@/lib/api/types"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { CurrencyInput } from "@/components/currency-input"
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
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

const planSchema = z.object({
  verticalId: z.string().min(1, "Selecciona una vertical"),
  code: z.string().min(1).max(40),
  name: z.string().min(1).max(80),
  billingCycle: z.enum(["MONTHLY", "QUARTERLY", "SEMIANNUAL", "ANNUAL"]),
  price: z.string().min(1, "Ingresa un precio"),
  currency: z.enum(["USD", "EUR", "COP"]),
})

type PlanFormValues = z.infer<typeof planSchema>

export function PlanFormDialog({
  open,
  onOpenChange,
  plan,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  plan?: Plan
}) {
  const queryClient = useQueryClient()
  const isEdit = Boolean(plan)

  const verticalsQuery = useQuery({
    queryKey: ["verticals", "catalog-all"],
    queryFn: () => listVerticals({ limit: 100 }),
    enabled: open,
  })

  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<PlanFormValues>({
    resolver: zodResolver(planSchema),
    defaultValues: { billingCycle: "MONTHLY", currency: "COP" },
  })

  const currency = useWatch({ control, name: "currency" })

  useEffect(() => {
    if (open) {
      reset({
        verticalId: plan?.verticalId ?? "",
        code: plan?.code ?? "",
        name: plan?.name ?? "",
        billingCycle: plan?.billingCycle ?? "MONTHLY",
        price: plan?.price ?? "",
        currency: plan?.currency ?? "COP",
      })
    }
  }, [open, plan, reset])

  const mutation = useMutation({
    mutationFn: (values: PlanFormValues) =>
      isEdit
        ? updatePlan(plan!.id, values)
        : createPlan(values),
    onSuccess: () => {
      toast.success(isEdit ? "Plan actualizado" : "Plan creado")
      queryClient.invalidateQueries({ queryKey: ["billing-plans"] })
      onOpenChange(false)
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  })

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEdit ? "Editar plan" : "Nuevo plan"}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit((values) => mutation.mutate(values))} className="grid gap-4 sm:grid-cols-2">
          <FormField label="Vertical" htmlFor="verticalId" error={errors.verticalId?.message} className="sm:col-span-2">
            <Controller
              control={control}
              name="verticalId"
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange} disabled={isEdit}>
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
              )}
            />
          </FormField>

          <FormField label="Código" htmlFor="code" error={errors.code?.message}>
            <Input id="code" {...register("code")} />
          </FormField>

          <FormField label="Nombre" htmlFor="name" error={errors.name?.message}>
            <Input id="name" {...register("name")} />
          </FormField>

          <FormField label="Ciclo de facturación" htmlFor="billingCycle">
            <Controller
              control={control}
              name="billingCycle"
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger id="billingCycle">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="MONTHLY">Mensual</SelectItem>
                    <SelectItem value="QUARTERLY">Trimestral</SelectItem>
                    <SelectItem value="SEMIANNUAL">Semestral</SelectItem>
                    <SelectItem value="ANNUAL">Anual</SelectItem>
                  </SelectContent>
                </Select>
              )}
            />
          </FormField>

          <FormField label="Precio" htmlFor="price" error={errors.price?.message}>
            <Controller
              control={control}
              name="price"
              render={({ field }) => (
                <CurrencyInput
                  id="price"
                  value={field.value}
                  onChange={field.onChange}
                  currency={currency}
                  placeholder="0"
                />
              )}
            />
          </FormField>

          <FormField label="Moneda" htmlFor="currency">
            <Controller
              control={control}
              name="currency"
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger id="currency">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="COP">COP</SelectItem>
                    <SelectItem value="USD">USD</SelectItem>
                    <SelectItem value="EUR">EUR</SelectItem>
                  </SelectContent>
                </Select>
              )}
            />
          </FormField>

          <DialogFooter className="sm:col-span-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting || mutation.isPending}>
              {isEdit ? "Guardar cambios" : "Crear plan"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
