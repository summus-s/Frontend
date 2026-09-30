"use client"

import { useEffect } from "react"
import { useForm, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"

import { createPlatformUser, updatePlatformUser, type PlatformUser } from "@/lib/api/platform-users"
import type { PlatformRoleKey } from "@/lib/api/auth"
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

const ROLE_KEYS: PlatformRoleKey[] = ["SUPERADMIN", "SALES", "SUPPORT", "ACCOUNTING", "AUDITOR"]

const userSchema = z.object({
  email: z.string().email("Correo inválido"),
  fullName: z.string().min(2, "Mínimo 2 caracteres").max(120),
  roleKeys: z.array(z.enum(["SUPERADMIN", "SALES", "SUPPORT", "ACCOUNTING", "AUDITOR"])),
  password: z.string().min(8, "Mínimo 8 caracteres").optional().or(z.literal("")),
})

type UserFormValues = z.infer<typeof userSchema>

export function UserFormDialog({
  open,
  onOpenChange,
  user,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  user?: PlatformUser
}) {
  const queryClient = useQueryClient()
  const isEdit = Boolean(user)

  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<UserFormValues>({
    resolver: zodResolver(userSchema),
    defaultValues: { roleKeys: [] },
  })

  useEffect(() => {
    if (open) {
      reset({
        email: user?.email ?? "",
        fullName: user?.fullName ?? "",
        password: "",
        roleKeys: user?.platformUserRoles.filter((r) => r.isActive).map((r) => r.platformRole?.key).filter(Boolean) as PlatformRoleKey[] ?? [],
      })
    }
  }, [open, user, reset])

  const mutation = useMutation({
    mutationFn: (values: UserFormValues) => {
      if (isEdit) {
        const payload: Record<string, unknown> = {
          email: values.email,
          fullName: values.fullName,
          roleKeys: values.roleKeys,
        }
        if (values.password) payload.password = values.password
        return updatePlatformUser(user!.id, payload)
      }
      return createPlatformUser({
        email: values.email,
        fullName: values.fullName,
        password: values.password ?? "",
        roleKeys: values.roleKeys,
      })
    },
    onSuccess: () => {
      toast.success(isEdit ? "Usuario actualizado" : "Usuario creado")
      queryClient.invalidateQueries({ queryKey: ["platform-users"] })
      onOpenChange(false)
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  })

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEdit ? "Editar usuario" : "Nuevo usuario interno"}</DialogTitle>
        </DialogHeader>

        <form
          onSubmit={handleSubmit((values) => {
            if (!isEdit && !values.password) {
              toast.error("La contraseña es obligatoria para crear un usuario")
              return
            }
            mutation.mutate(values)
          })}
          className="flex flex-col gap-4"
        >
          <FormField label="Nombre completo" htmlFor="fullName" error={errors.fullName?.message}>
            <Input id="fullName" {...register("fullName")} />
          </FormField>

          <FormField label="Correo" htmlFor="email" error={errors.email?.message}>
            <Input id="email" type="email" {...register("email")} />
          </FormField>

          <FormField
            label={isEdit ? "Nueva contraseña (opcional)" : "Contraseña"}
            htmlFor="password"
            error={errors.password?.message}
          >
            <Input id="password" type="password" {...register("password")} />
          </FormField>

          <FormField label="Roles" htmlFor="roleKeys">
            <Controller
              control={control}
              name="roleKeys"
              render={({ field }) => (
                <div className="flex flex-wrap gap-3">
                  {ROLE_KEYS.map((role) => (
                    <label key={role} className="flex items-center gap-1.5 text-sm">
                      <input
                        type="checkbox"
                        className="size-4 rounded border-input"
                        checked={field.value?.includes(role)}
                        onChange={(event) => {
                          const next = event.target.checked
                            ? [...(field.value ?? []), role]
                            : (field.value ?? []).filter((r) => r !== role)
                          field.onChange(next)
                        }}
                      />
                      {role}
                    </label>
                  ))}
                </div>
              )}
            />
          </FormField>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting || mutation.isPending}>
              {isEdit ? "Guardar cambios" : "Crear usuario"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
