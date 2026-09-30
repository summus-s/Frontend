"use client"

import { useState } from "react"
import Link from "next/link"
import { useQuery } from "@tanstack/react-query"
import { ChevronDown } from "lucide-react"

import { listPublicVerticals } from "@/lib/api/public-verticals"
import { listPublicPlans } from "@/lib/api/public-plans"
import { CURRENCY_SYMBOLS } from "@/components/currency-input"
import { Skeleton } from "@/components/ui/skeleton"

const CYCLE_LABELS: Record<string, string> = {
  MONTHLY: "/ mes",
  QUARTERLY: "/ trimestre",
  SEMIANNUAL: "/ semestre",
  ANNUAL: "/ año",
}

function formatPrice(price: string, currency: string) {
  const symbol = CURRENCY_SYMBOLS[currency] ?? currency
  const amount = Number(price)
  const formatted = new Intl.NumberFormat("es-CO", {
    minimumFractionDigits: amount % 1 === 0 ? 0 : 2,
    maximumFractionDigits: 2,
  }).format(amount)
  return `${symbol} ${formatted}`
}

function VerticalPlans({ verticalId }: { verticalId: string }) {
  const plansQuery = useQuery({
    queryKey: ["public-plans", verticalId],
    queryFn: () => listPublicPlans(verticalId),
  })

  if (plansQuery.isLoading) {
    return (
      <div className="mt-6 grid gap-3 sm:grid-cols-2">
        <Skeleton className="h-24 bg-white/10" />
        <Skeleton className="h-24 bg-white/10" />
      </div>
    )
  }

  if (!plansQuery.data || plansQuery.data.length === 0) {
    return (
      <p className="mt-6 text-sm text-slate-400">
        Todavía no hay planes publicados para esta solución.
      </p>
    )
  }

  return (
    <div className="mt-6 grid gap-3 sm:grid-cols-2">
      {plansQuery.data.map((plan) => (
        <div
          key={plan.id}
          className={`flex flex-col justify-between rounded-2xl border p-5 ${
            plan.isFeatured
              ? "border-blue-400/50 bg-blue-500/10"
              : "border-white/10 bg-white/5"
          }`}
        >
          <div>
            {plan.isFeatured && (
              <span className="mb-2 inline-block rounded-full bg-blue-500 px-2.5 py-0.5 text-xs font-semibold">
                Recomendado
              </span>
            )}
            <h4 className="font-semibold">{plan.name}</h4>
            {plan.description && (
              <p className="mt-1 text-sm text-slate-400">{plan.description}</p>
            )}
            <p className="mt-3 text-2xl font-bold">
              {formatPrice(plan.price, plan.currency)}
              <span className="ml-1 text-sm font-normal text-slate-400">
                {CYCLE_LABELS[plan.billingCycle] ?? ""}
              </span>
            </p>
          </div>
          <Link
            href={`/registro?verticalId=${verticalId}&planId=${plan.id}`}
            className="mt-4 block rounded-xl bg-white px-4 py-2 text-center text-sm font-semibold text-slate-950 hover:bg-slate-200"
          >
            Solicitar acceso
          </Link>
        </div>
      ))}
    </div>
  )
}

export default function HomePage() {
  const [expandedId, setExpandedId] = useState<string | null>(null)

  const verticalsQuery = useQuery({
    queryKey: ["public-verticals"],
    queryFn: listPublicVerticals,
  })

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <header className="sticky top-0 z-50 border-b border-white/10 bg-slate-950/90 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <Link href="/" className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500 font-bold text-white">
              S
            </div>
            <div>
              <p className="text-lg font-bold text-white">Summuss</p>
              <p className="text-xs text-slate-400">Core Platform</p>
            </div>
          </Link>

          <nav className="hidden items-center gap-8 text-sm text-slate-300 md:flex">
            <a href="#solutions" className="hover:text-white">Soluciones</a>
            <a href="#why" className="hover:text-white">Por qué Summuss</a>
            <a href="#contact" className="hover:text-white">Contacto</a>
          </nav>

          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="hidden rounded-xl px-4 py-2 text-sm font-semibold text-slate-300 hover:bg-white/10 hover:text-white sm:block"
            >
              Ingresar
            </Link>

            <a
              href="#solutions"
              className="rounded-xl bg-blue-500 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-600"
            >
              Ver soluciones
            </a>
          </div>
        </div>
      </header>
      <section className="mx-auto flex max-w-7xl flex-col items-center px-6 py-24 text-center">
        <span className="mb-6 rounded-full border border-blue-400/30 bg-blue-400/10 px-4 py-2 text-sm text-blue-300">
          Plataforma empresarial de software vertical
        </span>

        <h1 className="max-w-4xl text-4xl font-bold tracking-tight md:text-6xl">
          Centraliza, vende y administra tus verticales desde una sola plataforma.
        </h1>

        <p className="mt-6 max-w-2xl text-lg text-slate-300">
          Summuss permite gestionar empresas, planes, suscripciones, pagos,
          invitaciones y activación de software vertical para cada cliente.
        </p>

        <div className="mt-10 flex flex-col gap-4 sm:flex-row">
          <Link
            href="/login"
            className="rounded-xl bg-blue-500 px-6 py-3 font-semibold text-white hover:bg-blue-600"
          >
            Iniciar sesión
          </Link>

          <a
            href="#solutions"
            className="rounded-xl border border-white/20 px-6 py-3 font-semibold text-white hover:bg-white/10"
          >
            Ver soluciones
          </a>
        </div>
      </section>

      <section className="border-y border-white/10 bg-slate-900/60 px-6 py-20">
        <div className="mx-auto grid max-w-7xl gap-6 md:grid-cols-3">
          <div className="rounded-2xl bg-white/5 p-6">
            <h3 className="text-xl font-semibold">Gestión comercial</h3>
            <p className="mt-3 text-slate-300">
              Administra empresas, contactos, planes, contratos y suscripciones.
            </p>
          </div>

          <div className="rounded-2xl bg-white/5 p-6">
            <h3 className="text-xl font-semibold">Provisioning de verticales</h3>
            <p className="mt-3 text-slate-300">
              Activa tenants y conecta cada empresa con el software contratado.
            </p>
          </div>

          <div className="rounded-2xl bg-white/5 p-6">
            <h3 className="text-xl font-semibold">Control interno</h3>
            <p className="mt-3 text-slate-300">
              Maneja usuarios internos, roles, auditoría y trazabilidad operativa.
            </p>
          </div>
        </div>
      </section>

      <section id="solutions" className="mx-auto max-w-7xl px-6 py-24">
        <div className="text-center">
          <h2 className="text-3xl font-bold md:text-5xl">Nuestras soluciones</h2>
          <p className="mt-4 text-slate-300">
            Cada solución es una vertical lista para tu negocio, con sus propios planes.
          </p>
        </div>

        {verticalsQuery.isLoading && (
          <div className="mt-14 grid gap-6 md:grid-cols-2">
            <Skeleton className="h-32 bg-white/5" />
            <Skeleton className="h-32 bg-white/5" />
          </div>
        )}

        {!verticalsQuery.isLoading && (verticalsQuery.data?.length ?? 0) === 0 && (
          <p className="mt-14 text-center text-slate-400">
            Muy pronto vas a encontrar aquí nuestras primeras soluciones.
          </p>
        )}

        <div className="mt-14 flex flex-col gap-4">
          {verticalsQuery.data?.map((vertical) => {
            const isOpen = expandedId === vertical.id
            return (
              <div
                key={vertical.id}
                className="overflow-hidden rounded-3xl border border-white/10 bg-white/5"
              >
                <button
                  type="button"
                  onClick={() => setExpandedId(isOpen ? null : vertical.id)}
                  className="flex w-full items-center justify-between gap-4 p-8 text-left"
                >
                  <div>
                    <h3 className="text-2xl font-bold">{vertical.name}</h3>
                    <p className="mt-2 text-slate-300">
                      {vertical.description ?? "Solución lista para tu negocio."}
                    </p>
                  </div>
                  <ChevronDown
                    className={`size-6 shrink-0 text-slate-400 transition-transform ${
                      isOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>

                {isOpen && (
                  <div className="border-t border-white/10 px-8 pb-8">
                    <VerticalPlans verticalId={vertical.id} />
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </section>

      <section className="bg-slate-900 px-6 py-20 text-center">
        <h2 className="text-3xl font-bold">¿Listo para administrar tus verticales?</h2>
        <p className="mx-auto mt-4 max-w-2xl text-slate-300">
          Con Summuss puedes controlar el ciclo completo: empresa, contrato,
          plan, pago, suscripción, tenant e invitación inicial.
        </p>

        <Link
          href="/login"
          className="mt-8 inline-block rounded-xl bg-blue-500 px-6 py-3 font-semibold text-white hover:bg-blue-600"
        >
          Entrar al portal
        </Link>
      </section>
    </main>
  )
}
