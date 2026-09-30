import Link from "next/link";

const plans = [
  {
    name: "Plan Básico",
    price: "€29",
    description: "Ideal para empresas pequeñas que quieren iniciar con una vertical.",
    features: ["1 vertical activa", "Soporte básico", "Gestión de empresa", "Acceso inicial"],
  },
  {
    name: "Plan Profesional",
    price: "€59",
    description: "Para empresas que necesitan más control, soporte y escalabilidad.",
    features: ["Varias verticales", "Soporte prioritario", "Facturación", "Provisioning automático"],
    highlighted: true,
  },
  {
    name: "Plan Enterprise",
    price: "A medida",
    description: "Solución avanzada para compañías con necesidades específicas.",
    features: ["Múltiples empresas", "Integraciones", "Auditoría", "Acompañamiento personalizado"],
  },
];

export default function HomePage() {
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
            <a href="#plans" className="hover:text-white">Planes</a>
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
              href="#plans"
              className="rounded-xl bg-blue-500 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-600"
            >
              Ver planes
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
            href="#plans"
            className="rounded-xl border border-white/20 px-6 py-3 font-semibold text-white hover:bg-white/10"
          >
            Ver planes
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

      <section id="plans" className="mx-auto max-w-7xl px-6 py-24">
        <div className="text-center">
          <h2 className="text-3xl font-bold md:text-5xl">Planes para cada etapa</h2>
          <p className="mt-4 text-slate-300">
            Elige el plan adecuado según el tamaño y operación de tu empresa.
          </p>
        </div>

        <div className="mt-14 grid gap-6 md:grid-cols-3">
          {plans.map((plan) => (
            <article
              key={plan.name}
              className={`rounded-3xl border p-8 ${
                plan.highlighted
                  ? "border-blue-400 bg-blue-500/10 shadow-2xl shadow-blue-500/20"
                  : "border-white/10 bg-white/5"
              }`}
            >
              {plan.highlighted && (
                <span className="mb-5 inline-block rounded-full bg-blue-500 px-3 py-1 text-sm font-semibold">
                  Recomendado
                </span>
              )}

              <h3 className="text-2xl font-bold">{plan.name}</h3>
              <p className="mt-4 text-slate-300">{plan.description}</p>

              <div className="mt-8">
                <span className="text-4xl font-bold">{plan.price}</span>
                {plan.price !== "A medida" && (
                  <span className="text-slate-400"> / mes</span>
                )}
              </div>

              <ul className="mt-8 space-y-3 text-slate-300">
                {plan.features.map((feature) => (
                  <li key={feature}>✓ {feature}</li>
                ))}
              </ul>

              <Link
                href="/login"
                className={`mt-8 block rounded-xl px-5 py-3 text-center font-semibold ${
                  plan.highlighted
                    ? "bg-blue-500 text-white hover:bg-blue-600"
                    : "bg-white text-slate-950 hover:bg-slate-200"
                }`}
              >
                Solicitar acceso
              </Link>
            </article>
          ))}
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
  );
}
