"use client"

import { useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { toast } from "sonner"
import { ArrowLeft } from "lucide-react"

import { useAuth } from "@/lib/auth/auth-context"
import { getErrorMessage } from "@/lib/api/types"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { FormField } from "@/components/form-field"

const loginSchema = z.object({
  email: z.string().email("Ingresa un correo válido"),
  password: z.string().min(8, "La contraseña debe tener al menos 8 caracteres"),
})

type LoginValues = z.infer<typeof loginSchema>

export default function AdminLoginPage() {
  const router = useRouter()
  const { login, status } = useAuth()

  useEffect(() => {
    if (status === "authenticated") {
      router.replace("/dashboard")
    }
  }, [status, router])

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginValues>({ resolver: zodResolver(loginSchema) })

  async function onSubmit(values: LoginValues) {
    try {
      await login(values.email, values.password)
      toast.success("Sesión iniciada correctamente")
      router.replace("/dashboard")
    } catch (error) {
      toast.error(getErrorMessage(error))
    }
  }

  return (
    <main className="relative flex min-h-screen flex-1 items-center justify-center overflow-hidden bg-slate-950 px-6 text-white">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-32 left-1/2 h-96 w-96 -translate-x-1/2 rounded-full bg-blue-600/20 blur-[120px]" />
        <div className="absolute bottom-0 right-0 h-72 w-72 rounded-full bg-indigo-500/10 blur-[100px]" />
      </div>

      <div className="relative w-full max-w-sm">
        <Link
          href="/login"
          className="mb-6 flex items-center gap-1.5 text-sm text-slate-400 hover:text-white"
        >
          <ArrowLeft className="size-4" />
          Elegir otro portal
        </Link>

        <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-8 shadow-2xl shadow-black/40 backdrop-blur">
          <div className="mb-6 flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 font-bold shadow-lg shadow-blue-500/20">
              S
            </div>
            <div>
              <p className="text-lg font-bold leading-none">Summuss</p>
              <p className="mt-1 text-xs text-slate-400">Panel administrativo</p>
            </div>
          </div>

          <h1 className="text-xl font-semibold">Ingresar</h1>
          <p className="mt-1 text-sm text-slate-400">
            Acceso exclusivo para el equipo interno de Summuss.
          </p>

          <form onSubmit={handleSubmit(onSubmit)} className="mt-6 flex flex-col gap-4">
            <FormField label="Correo" htmlFor="email" error={errors.email?.message}>
              <Input
                id="email"
                type="email"
                autoComplete="email"
                placeholder="tu@summuss.com"
                className="bg-white/5 text-white placeholder:text-slate-500"
                {...register("email")}
              />
            </FormField>

            <FormField label="Contraseña" htmlFor="password" error={errors.password?.message}>
              <Input
                id="password"
                type="password"
                autoComplete="current-password"
                className="bg-white/5 text-white placeholder:text-slate-500"
                {...register("password")}
              />
            </FormField>

            <Button
              type="submit"
              disabled={isSubmitting}
              className="mt-2 bg-blue-500 hover:bg-blue-600"
            >
              {isSubmitting ? "Ingresando..." : "Ingresar"}
            </Button>
          </form>
        </div>
      </div>
    </main>
  )
}
