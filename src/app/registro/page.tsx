"use client"

import { Suspense, useState } from "react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { useQuery } from "@tanstack/react-query"
import { ArrowLeft } from "lucide-react"

import { listPublicVerticals } from "@/lib/api/public-verticals"
import { listPublicPlans } from "@/lib/api/public-plans"
import { createRegistration } from "@/lib/api/public-registrations"
import { getErrorMessage } from "@/lib/api/types"
import { CURRENCY_SYMBOLS } from "@/components/currency-input"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { FormField } from "@/components/form-field"
import { Spinner } from "@/components/ui/spinner"

const registrationSchema = z.object({
  companyName: z.string().min(1, "Ingresa el nombre de la empresa").max(120),
  legalName: z.string().max(150).optional().or(z.literal("")),
  taxId: z.string().max(50).optional().or(z.literal("")),
  contactFullName: z.string().min(1, "Ingresa tu nombre completo").max(120),
  contactEmail: z.string().email("Ingresa un correo válido"),
  contactPhone: z.string().max(40).optional().or(z.literal("")),
})

type RegistrationValues = z.infer<typeof registrationSchema>

function formatPrice(price: string, currency: string) {
  const symbol = CURRENCY_SYMBOLS[currency] ?? currency
  const amount = Number(price)
  const formatted = new Intl.NumberFormat("es-CO", {
    minimumFractionDigits: amount % 1 === 0 ? 0 : 2,
    maximumFractionDigits: 2,
  }).format(amount)
  return `${symbol} ${formatted}`
}

function RegistrationForm() {
  const searchParams = useSearchParams()
  const verticalId = searchParams.get("verticalId") ?? ""
  const planId = searchParams.get("planId") ?? ""
  const [submitError, setSubmitError] = useState<string | null>(null)

  const verticalsQuery = useQuery({
    queryKey: ["public-verticals"],
    queryFn: listPublicVerticals,
    enabled: Boolean(verticalId),
  })

  const plansQuery = useQuery({
    queryKey: ["public-plans", verticalId],
    queryFn: () => listPublicPlans(verticalId),
    enabled: Boolean(verticalId),
  })

  const vertical = verticalsQuery.data?.find((item) => item.id === verticalId)
  const plan = plansQuery.data?.find((item) => item.id === planId)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegistrationValues>({ resolver: zodResolver(registrationSchema) })

  async function onSubmit(values: RegistrationValues) {
    setSubmitError(null)
    try {
      const result = await createRegistration({
        verticalId,
        planId,
        companyName: values.companyName,
        legalName: values.legalName || undefined,
        taxId: values.taxId || undefined,
        contactFullName: values.contactFullName,
        contactEmail: values.contactEmail,
        contactPhone: values.contactPhone || undefined,
      })
      window.location.assign(result.checkoutUrl)
    } catch (error) {
      setSubmitError(getErrorMessage(error))
    }
  }

  if (!verticalId || !planId) {
    return (
      <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-8 text-center">
        <h1 className="text-lg font-semibold">Falta seleccionar un plan</h1>
        <p className="mt-2 text-sm text-slate-400">
          Vuelve al inicio y elige una solución y un plan para continuar.
        </p>
        <Link
          href="/#solutions"
          className="mt-6 inline-block rounded-xl bg-blue-500 px-5 py-2.5 text-sm font-semibold hover:bg-blue-600"
        >
          Ver soluciones
        </Link>
      </div>
    )
  }

  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-8 shadow-2xl shadow-black/40">
      <h1 className="text-xl font-semibold">Crea tu cuenta</h1>

      {(vertical || plan) && (
        <p className="mt-1 text-sm text-slate-400">
          {vertical?.name}
          {plan && (
            <>
              {" · "}
              {plan.name} — {formatPrice(plan.price, plan.currency)}
            </>
          )}
        </p>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="mt-6 flex flex-col gap-4">
        <FormField label="Nombre de la empresa" htmlFor="companyName" error={errors.companyName?.message}>
          <Input
            id="companyName"
            className="bg-white/5 text-white placeholder:text-slate-500"
            {...register("companyName")}
          />
        </FormField>

        <FormField label="Razón social (opcional)" htmlFor="legalName" error={errors.legalName?.message}>
          <Input
            id="legalName"
            className="bg-white/5 text-white placeholder:text-slate-500"
            {...register("legalName")}
          />
        </FormField>

        <FormField label="NIT / Tax ID (opcional)" htmlFor="taxId" error={errors.taxId?.message}>
          <Input
            id="taxId"
            className="bg-white/5 text-white placeholder:text-slate-500"
            {...register("taxId")}
          />
        </FormField>

        <div className="my-2 border-t border-white/10" />

        <FormField label="Tu nombre completo" htmlFor="contactFullName" error={errors.contactFullName?.message}>
          <Input
            id="contactFullName"
            className="bg-white/5 text-white placeholder:text-slate-500"
            {...register("contactFullName")}
          />
        </FormField>

        <FormField label="Tu correo" htmlFor="contactEmail" error={errors.contactEmail?.message}>
          <Input
            id="contactEmail"
            type="email"
            className="bg-white/5 text-white placeholder:text-slate-500"
            {...register("contactEmail")}
          />
        </FormField>

        <FormField label="Teléfono (opcional)" htmlFor="contactPhone" error={errors.contactPhone?.message}>
          <Input
            id="contactPhone"
            className="bg-white/5 text-white placeholder:text-slate-500"
            {...register("contactPhone")}
          />
        </FormField>

        {submitError && <p className="text-sm text-red-400">{submitError}</p>}

        <Button type="submit" disabled={isSubmitting} className="mt-2 bg-blue-500 hover:bg-blue-600">
          {isSubmitting ? "Creando tu cuenta..." : "Continuar al pago"}
        </Button>

        <p className="text-center text-xs text-slate-500">
          Te enviaremos un correo con el link de pago por si necesitas retomarlo después.
        </p>
      </form>
    </div>
  )
}

export default function RegistrationPage() {
  return (
    <main className="relative flex min-h-screen flex-1 items-center justify-center overflow-hidden bg-slate-950 px-6 py-16 text-white">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-32 left-1/2 h-96 w-96 -translate-x-1/2 rounded-full bg-blue-600/20 blur-[120px]" />
      </div>

      <div className="relative w-full max-w-md">
        <Link href="/" className="mb-6 flex items-center gap-1.5 text-sm text-slate-400 hover:text-white">
          <ArrowLeft className="size-4" />
          Volver al inicio
        </Link>

        <Suspense
          fallback={
            <div className="flex justify-center py-16">
              <Spinner className="size-6" />
            </div>
          }
        >
          <RegistrationForm />
        </Suspense>
      </div>
    </main>
  )
}
