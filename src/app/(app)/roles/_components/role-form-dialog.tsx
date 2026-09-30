"use client"

import { useForm, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"

import { createPlatformRole } from "@/lib/api/platform-roles"
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
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

const roleSchema = z.object({
  key: z.enum(["SUPERADMIN", "SALES", "SUPPORT", "ACCOUNTING", "AUDITOR"]),
  name: z.string().min(2).max(80),
})

type RoleFormValues = z.infer<typeof roleSchema>

export function RoleFormDialog({
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
  } = useForm<RoleFormValues>({
    resolver: zodResolver(roleSchema),
    defaultValues: { key: "SALES" },
  })

  const mutation = useMutation({
    mutationFn: (values: RoleFormValues) => createPlatformRole(values),
    onSuccess: () => {
      toast.success("Rol creado")
      queryClient.invalidateQueries({ queryKey: ["platform-roles"] })
      reset()
      onOpenChange(false)
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  })

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Nuevo rol</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit((values) => mutation.mutate(values))} className="flex flex-col gap-4">
          <FormField label="Clave" htmlFor="key">
            <Controller
              control={control}
              name="key"
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger id="key">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="SUPERADMIN">SUPERADMIN</SelectItem>
                    <SelectItem value="SALES">SALES</SelectItem>
                    <SelectItem value="SUPPORT">SUPPORT</SelectItem>
                    <SelectItem value="ACCOUNTING">ACCOUNTING</SelectItem>
                    <SelectItem value="AUDITOR">AUDITOR</SelectItem>
                  </SelectContent>
                </Select>
              )}
            />
          </FormField>

          <FormField label="Nombre visible" htmlFor="name" error={errors.name?.message}>
            <Input id="name" {...register("name")} />
          </FormField>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting || mutation.isPending}>
              Crear rol
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
