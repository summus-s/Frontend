"use client"

import { useState } from "react"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { Plus } from "lucide-react"

import { createInvite, listInvites, resendInvite, revokeInvite } from "@/lib/api/invites"
import { getErrorMessage } from "@/lib/api/types"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { StatusBadge } from "@/components/status-badge"

export function InvitesSection({ companyVerticalId }: { companyVerticalId: string }) {
  const queryClient = useQueryClient()
  const [showForm, setShowForm] = useState(false)
  const [email, setEmail] = useState("")
  const [fullName, setFullName] = useState("")

  const invitesQuery = useQuery({
    queryKey: ["invites", companyVerticalId],
    queryFn: () => listInvites({ companyVerticalId, limit: 20 }),
  })

  function invalidate() {
    queryClient.invalidateQueries({ queryKey: ["invites", companyVerticalId] })
  }

  const createMutation = useMutation({
    mutationFn: () => createInvite({ companyVerticalId, email, fullName: fullName || undefined }),
    onSuccess: () => {
      toast.success("Invitación enviada")
      setEmail("")
      setFullName("")
      setShowForm(false)
      invalidate()
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  })

  const resendMutation = useMutation({
    mutationFn: (id: string) => resendInvite(id),
    onSuccess: () => {
      toast.success("Invitación reenviada")
      invalidate()
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  })

  const revokeMutation = useMutation({
    mutationFn: (id: string) => revokeInvite(id),
    onSuccess: () => {
      toast.success("Invitación revocada")
      invalidate()
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  })

  return (
    <section className="rounded-xl border border-border p-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold">Invitaciones</h3>
        <Button size="sm" variant="outline" onClick={() => setShowForm((value) => !value)}>
          <Plus className="size-4" />
          Invitar
        </Button>
      </div>

      {showForm && (
        <div className="mt-3 flex flex-col gap-2 rounded-lg bg-muted/50 p-3">
          <Input placeholder="Correo del invitado" value={email} onChange={(e) => setEmail(e.target.value)} />
          <Input placeholder="Nombre (opcional)" value={fullName} onChange={(e) => setFullName(e.target.value)} />
          <Button
            size="sm"
            className="w-fit"
            disabled={!email || createMutation.isPending}
            onClick={() => createMutation.mutate()}
          >
            Enviar invitación
          </Button>
        </div>
      )}

      <div className="mt-3 flex flex-col gap-2">
        {invitesQuery.data?.items.length === 0 && (
          <p className="text-sm text-muted-foreground">Sin invitaciones registradas.</p>
        )}
        {invitesQuery.data?.items.map((invite) => (
          <div key={invite.id} className="flex items-center justify-between gap-2 rounded-lg border border-border px-3 py-2">
            <div>
              <p className="text-sm font-medium">{invite.email}</p>
              <p className="text-xs text-muted-foreground">{invite.fullName ?? "Sin nombre"}</p>
            </div>
            <div className="flex items-center gap-2">
              <StatusBadge status={invite.status} />
              {invite.status === "PENDING" && (
                <>
                  <Button size="sm" variant="ghost" onClick={() => resendMutation.mutate(invite.id)}>
                    Reenviar
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="text-destructive"
                    onClick={() => revokeMutation.mutate(invite.id)}
                  >
                    Revocar
                  </Button>
                </>
              )}
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
