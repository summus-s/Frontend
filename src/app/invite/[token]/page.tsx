"use client"

import { use, useState } from "react"
import Link from "next/link"
import { useMutation, useQuery } from "@tanstack/react-query"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { ArrowRight, CheckCircle2, PartyPopper } from "lucide-react"

import { acceptPublicInvite, getPublicInvite, type AcceptInviteResult } from "@/lib/api/public-invites"
import { getErrorMessage } from "@/lib/api/types"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { FormField } from "@/components/form-field"
import { Spinner } from "@/components/ui/spinner"

const acceptSchema = z.object({
  email: z.string().email("Ingresa un correo válido"),
  fullName: z.string().max(160).optional(),
})

type AcceptValues = z.infer<typeof acceptSchema>

export default function AcceptInvitePage({
  params,
}: {
  params: Promise<{ token: string }>
}) {
  const { token } = use(params)
  const [result, setResult] = useState<AcceptInviteResult | null>(null)

  const inviteQuery = useQuery({
    queryKey: ["public-invite", token],
    queryFn: () => getPublicInvite(token),
    retry: false,
  })

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<AcceptValues>({
    resolver: zodResolver(acceptSchema),
    values: inviteQuery.data
      ? { email: inviteQuery.data.email, fullName: inviteQuery.data.fullName ?? "" }
      : undefined,
  })

  const acceptMutation = useMutation({
    mutationFn: (values: AcceptValues) => acceptPublicInvite(token, values),
    onSuccess: (data) => setResult(data),
  })

  async function onSubmit(values: AcceptValues) {
    try {
      await acceptMutation.mutateAsync(values)
    } catch {
      // toasts not needed here; error renders inline below
    }
  }

  return (
    <main className="relative flex min-h-screen flex-1 items-center justify-center overflow-hidden bg-slate-950 px-6 py-16 text-white">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-32 left-1/2 h-96 w-96 -translate-x-1/2 rounded-full bg-blue-600/20 blur-[120px]" />
      </div>

      <div className="relative w-full max-w-md">
        <Link href="/" className="mb-8 flex items-center justify-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500 font-bold">
            S
          </div>
          <div>
            <p className="text-lg font-bold">Summuss</p>
            <p className="text-xs text-slate-400">Invitación</p>
          </div>
        </Link>

        <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-8 shadow-2xl shadow-black/40">
          {inviteQuery.isLoading && (
            <div className="flex flex-col items-center gap-3 py-8 text-slate-400">
              <Spinner className="size-6" />
              Cargando invitación...
            </div>
          )}

          {inviteQuery.isError && (
            <div className="py-6 text-center">
              <h1 className="text-lg font-semibold">Invitación no disponible</h1>
              <p className="mt-2 text-sm text-slate-400">
                {getErrorMessage(inviteQuery.error)}
              </p>
            </div>
          )}

          {result && (
            <div className="flex flex-col items-center gap-4 py-4 text-center">
              <PartyPopper className="size-10 text-blue-400" />
              <div>
                <h1 className="text-lg font-semibold">¡Cuenta lista!</h1>
                <p className="mt-2 text-sm text-slate-400">
                  Ya puedes entrar a {result.onboarding.verticalName}.
                </p>
              </div>
              <a
                href={result.onboarding.verticalAppBaseUrl}
                className="mt-2 flex items-center gap-1.5 rounded-xl bg-blue-500 px-5 py-2.5 text-sm font-semibold hover:bg-blue-600"
              >
                Ir a {result.onboarding.verticalName}
                <ArrowRight className="size-4" />
              </a>
            </div>
          )}

          {inviteQuery.data && !result && (
            <>
              <div className="mb-2 flex items-center gap-2 text-blue-400">
                <CheckCircle2 className="size-4" />
                <span className="text-xs font-medium uppercase tracking-wide">
                  Invitación de {inviteQuery.data.company.name}
                </span>
              </div>
              <h1 className="text-xl font-semibold">
                Únete a {inviteQuery.data.companyVertical.vertical.name}
              </h1>
              <p className="mt-1 text-sm text-slate-400">
                Confirma tus datos para activar tu acceso.
              </p>

              <form onSubmit={handleSubmit(onSubmit)} className="mt-6 flex flex-col gap-4">
                <FormField label="Correo" htmlFor="email" error={errors.email?.message}>
                  <Input
                    id="email"
                    type="email"
                    className="bg-white/5 text-white placeholder:text-slate-500"
                    {...register("email")}
                  />
                </FormField>

                <FormField label="Nombre completo" htmlFor="fullName" error={errors.fullName?.message}>
                  <Input
                    id="fullName"
                    className="bg-white/5 text-white placeholder:text-slate-500"
                    {...register("fullName")}
                  />
                </FormField>

                {acceptMutation.isError && (
                  <p className="text-sm text-red-400">{getErrorMessage(acceptMutation.error)}</p>
                )}

                <Button type="submit" disabled={isSubmitting} className="mt-2 bg-blue-500 hover:bg-blue-600">
                  {isSubmitting ? "Activando..." : "Activar mi acceso"}
                </Button>
              </form>
            </>
          )}
        </div>
      </div>
    </main>
  )
}
