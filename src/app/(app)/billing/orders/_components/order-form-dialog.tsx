"use client"

import { useForm, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"

import { createOrder } from "@/lib/api/billing-orders"
import { getErrorMessage } from "@/lib/api/types"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
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

const orderSchema = z.object({
  companyVerticalId: z.string().uuid("Debe ser un UUID válido"),
  totalAmount: z.string().min(1, "Ingresa un monto"),
  currency: z.enum(["USD", "EUR", "COP"]),
  provider: z.enum(["MANUAL", "STRIPE", "MERCADOPAGO"]),
})

type OrderFormValues = z.infer<typeof orderSchema>

export function OrderFormDialog({
  open,
  onOpenChange,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const queryClient = useQueryClient()

  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<OrderFormValues>({
    resolver: zodResolver(orderSchema),
    defaultValues: { currency: "COP", provider: "MANUAL" },
  })

  const mutation = useMutation({
    mutationFn: (values: OrderFormValues) => createOrder(values),
    onSuccess: () => {
      toast.success("Orden creada")
      queryClient.invalidateQueries({ queryKey: ["billing-orders"] })
      reset()
      onOpenChange(false)
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  })

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Nueva orden</DialogTitle>
          <DialogDescription>
            Registra un cobro manual para una empresa-vertical. Copia el ID de
            &ldquo;company-vertical&rdquo; desde el detalle de la empresa.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit((values) => mutation.mutate(values))} className="flex flex-col gap-4">
          <FormField
            label="Company-Vertical ID"
            htmlFor="companyVerticalId"
            error={errors.companyVerticalId?.message}
          >
            <Input id="companyVerticalId" placeholder="uuid..." {...register("companyVerticalId")} />
          </FormField>

          <FormField label="Monto" htmlFor="totalAmount" error={errors.totalAmount?.message}>
            <Input id="totalAmount" placeholder="29.90" {...register("totalAmount")} />
          </FormField>

          <div className="grid grid-cols-2 gap-4">
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

            <FormField label="Proveedor" htmlFor="provider">
              <Controller
                control={control}
                name="provider"
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger id="provider">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="MANUAL">Manual</SelectItem>
                      <SelectItem value="MERCADOPAGO">Mercado Pago</SelectItem>
                      <SelectItem value="STRIPE">Stripe</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
            </FormField>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting || mutation.isPending}>
              Crear orden
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
