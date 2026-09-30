"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  Building2,
  LayoutDashboard,
  Layers,
  Mail,
  Receipt,
  ScrollText,
  ShieldCheck,
  Users,
  Wallet,
} from "lucide-react"

import { useAuth } from "@/lib/auth/auth-context"
import type { PlatformRoleKey } from "@/lib/api/auth"
import { cn } from "@/lib/utils"

interface NavItem {
  href: string
  label: string
  icon: React.ComponentType<{ className?: string }>
  roles?: PlatformRoleKey[]
}

interface NavSection {
  label: string
  items: NavItem[]
}

const NAV_SECTIONS: NavSection[] = [
  {
    label: "General",
    items: [
      { href: "/dashboard", label: "Panel", icon: LayoutDashboard },
      { href: "/companies", label: "Empresas", icon: Building2 },
      { href: "/invites", label: "Invitaciones", icon: Mail, roles: ["SUPERADMIN", "SALES", "SUPPORT", "AUDITOR"] },
    ],
  },
  {
    label: "Facturación",
    items: [
      { href: "/billing/plans", label: "Planes", icon: Receipt, roles: ["SUPERADMIN"] },
      { href: "/billing/orders", label: "Órdenes", icon: Wallet, roles: ["SUPERADMIN", "SALES", "ACCOUNTING"] },
    ],
  },
  {
    label: "Catálogo",
    items: [{ href: "/verticals", label: "Verticales", icon: Layers, roles: ["SUPERADMIN"] }],
  },
  {
    label: "Administración",
    items: [
      { href: "/users", label: "Usuarios internos", icon: Users, roles: ["SUPERADMIN"] },
      { href: "/roles", label: "Roles", icon: ShieldCheck, roles: ["SUPERADMIN"] },
      { href: "/audit-logs", label: "Auditoría", icon: ScrollText, roles: ["SUPERADMIN", "AUDITOR"] },
    ],
  },
]

export function AppSidebar() {
  const pathname = usePathname()
  const { hasRole, user } = useAuth()

  const sections = NAV_SECTIONS.map((section) => ({
    ...section,
    items: section.items.filter((item) => !item.roles || hasRole(...item.roles)),
  })).filter((section) => section.items.length > 0)

  return (
    <aside className="hidden w-64 shrink-0 flex-col border-r border-border bg-card md:flex">
      <div className="flex h-14 items-center gap-2 border-b border-border px-4">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 text-sm font-bold text-white shadow-sm shadow-blue-500/30">
          S
        </div>
        <div>
          <p className="text-sm font-semibold leading-none">Summuss</p>
          <p className="text-xs text-muted-foreground">Core Platform</p>
        </div>
      </div>

      <nav className="flex flex-1 flex-col gap-4 overflow-y-auto p-3">
        {sections.map((section) => (
          <div key={section.label} className="flex flex-col gap-0.5">
            <p className="px-3 pb-1 text-[11px] font-semibold tracking-wide text-muted-foreground/70 uppercase">
              {section.label}
            </p>
            {section.items.map((item) => {
              const active = pathname === item.href || pathname.startsWith(`${item.href}/`)
              const Icon = item.icon
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                    active
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground",
                  )}
                >
                  <Icon className="size-4" />
                  {item.label}
                </Link>
              )
            })}
          </div>
        ))}
      </nav>

      {user && (
        <div className="border-t border-border p-3">
          <p className="truncate text-sm font-medium">{user.fullName}</p>
          <p className="truncate text-xs text-muted-foreground">{user.email}</p>
        </div>
      )}
    </aside>
  )
}
