import Link from "next/link"
import { Clock } from "lucide-react"

export default function RegistrationPendingPage() {
  return (
    <main className="flex min-h-screen flex-1 items-center justify-center bg-slate-950 px-6 text-white">
      <div className="w-full max-w-md rounded-2xl border border-white/10 bg-white/[0.04] p-8 text-center shadow-2xl shadow-black/40">
        <Clock className="mx-auto size-10 text-amber-400" />
        <h1 className="mt-4 text-xl font-semibold">Tu pago está en proceso</h1>
        <p className="mt-2 text-sm text-slate-400">
          Algunos métodos de pago tardan un poco más en confirmarse. Te avisaremos
          por correo apenas se confirme y quede activa tu cuenta.
        </p>
        <Link
          href="/"
          className="mt-6 inline-block rounded-xl bg-blue-500 px-5 py-2.5 text-sm font-semibold hover:bg-blue-600"
        >
          Volver al inicio
        </Link>
      </div>
    </main>
  )
}
