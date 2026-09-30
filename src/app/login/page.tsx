"use client"

import Link from "next/link"
import { useQuery } from "@tanstack/react-query"
import { ArrowLeft, ArrowRight, Layers, ShieldCheck } from "lucide-react"

import { listPublicVerticals } from "@/lib/api/public-verticals"
import { Skeleton } from "@/components/ui/skeleton"

export default function PortalSelectorPage() {
  const verticalsQuery = useQuery({
    queryKey: ["public-verticals"],
    queryFn: listPublicVerticals,
    retry: false,
  })

  const verticals = verticalsQuery.data ?? []

  return (
    <main className="relative flex min-h-screen flex-1 flex-col items-center overflow-hidden bg-slate-950 px-6 py-16 text-white">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-40 left-1/2 h-96 w-96 -translate-x-1/2 rounded-full bg-blue-600/20 blur-[120px]" />
        <div className="absolute bottom-0 right-0 h-72 w-72 rounded-full bg-indigo-500/10 blur-[100px]" />
      </div>

      <div className="relative w-full max-w-2xl">
        <Link
          href="/"
          className="mb-10 flex w-fit items-center gap-1.5 text-sm text-slate-400 hover:text-white"
        >
          <ArrowLeft className="size-4" />
          Volver al inicio
        </Link>

        <div className="text-center">
          <span className="mb-4 inline-block rounded-full border border-blue-400/30 bg-blue-400/10 px-4 py-1.5 text-xs font-medium text-blue-300">
            Selecciona tu portal
          </span>
          <h1 className="text-3xl font-bold tracking-tight md:text-4xl">
            ¿A dónde quieres entrar?
          </h1>
          <p className="mt-3 text-slate-400">
            Cada vertical de Summuss tiene su propia aplicación e inicio de sesión.
          </p>
        </div>

        <div className="mt-10 grid gap-4 sm:grid-cols-2">
          <Link
            href="/login/admin"
            className="group flex flex-col justify-between rounded-2xl border border-white/10 bg-white/[0.04] p-6 text-left transition-all hover:border-blue-400/40 hover:bg-white/[0.07]"
          >
            <div>
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 shadow-lg shadow-blue-500/20">
                <ShieldCheck className="size-5" />
              </div>
              <h2 className="mt-4 text-lg font-semibold">Summuss Administrativo</h2>
              <p className="mt-1 text-sm text-slate-400">
                Gestión comercial, empresas, facturación y control interno.
              </p>
            </div>
            <span className="mt-6 flex items-center gap-1.5 text-sm font-medium text-blue-400 group-hover:gap-2.5 transition-all">
              Ingresar
              <ArrowRight className="size-4" />
            </span>
          </Link>

          {verticalsQuery.isLoading &&
            Array.from({ length: 1 }).map((_, index) => (
              <div
                key={index}
                className="rounded-2xl border border-white/10 bg-white/[0.02] p-6"
              >
                <Skeleton className="h-11 w-11 rounded-xl bg-white/10" />
                <Skeleton className="mt-4 h-5 w-2/3 bg-white/10" />
                <Skeleton className="mt-2 h-4 w-full bg-white/10" />
              </div>
            ))}

          {verticals.map((vertical) => (
            <a
              key={vertical.id}
              href={vertical.appBaseUrl}
              className="group flex flex-col justify-between rounded-2xl border border-white/10 bg-white/[0.04] p-6 text-left transition-all hover:border-indigo-400/40 hover:bg-white/[0.07]"
            >
              <div>
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 shadow-lg shadow-indigo-500/20">
                  <Layers className="size-5" />
                </div>
                <h2 className="mt-4 text-lg font-semibold">{vertical.name}</h2>
                <p className="mt-1 text-sm text-slate-400">
                  {vertical.description ?? "Aplicación independiente de Summuss."}
                </p>
              </div>
              <span className="mt-6 flex items-center gap-1.5 text-sm font-medium text-indigo-400 group-hover:gap-2.5 transition-all">
                Ingresar
                <ArrowRight className="size-4" />
              </span>
            </a>
          ))}
        </div>

        {!verticalsQuery.isLoading && verticals.length === 0 && (
          <p className="mt-8 text-center text-sm text-slate-500">
            Aún no hay verticales activas. Cuando actives una desde el panel administrativo,
            su acceso aparecerá aquí automáticamente.
          </p>
        )}
      </div>
    </main>
  )
}
