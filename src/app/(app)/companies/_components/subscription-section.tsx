"use client"

import { useState } from "react"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"

import {
  createSubscription,
  renewSubscription,
  listSubscriptions,
} from "@/lib/api/billing-subscriptions"
import { listPlans } from "@/lib/api/billing-plans"
import { getErrorMessage } from "@/lib/api/types"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { FormField } from "@/components/form-field"
import { StatusBadge } from "@/components/status-badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

function todayIso() {
  return new Date().toISOString().slice(0, 10)
}

function inOneMonthIso() {
  const date = new Date()
  date.setMonth(date.getMonth() + 1)
  return date.toISOString().slice(0, 10)
}

export function SubscriptionSection({
  companyVerticalId,
  verticalId,
}: {
  companyVerticalId: string
  verticalId: string
}) {
  const queryClient = useQueryClient()
  const [planId, setPlanId] = useState("")
  const [periodStart, setPeriodStart] = useState(todayIso())
  const [periodEnd, setPeriodEnd] = useState(inOneMonthIso())

  const subscriptionQuery = useQuery({
    queryKey: ["subscriptions", companyVerticalId],
    queryFn: () => listSubscriptions({ companyVerticalId, limit: 1 }),
  })

  const plansQuery = useQuery({
    queryKey: ["billing-plans", verticalId],
    queryFn: () => listPlans({ verticalId, isActive: true, limit: 100 }),
  })

  const subscription = subscriptionQuery.data?.items[0]

  const createMutation = useMutation({
    mutationFn: () =>
      createSubscription({
        companyVerticalId,
        planId,
        currentPeriodStart: periodStart,
        currentPeriodEnd: periodEnd,
        provider: "MANUAL",
      }),
    onSuccess: () => {
      toast.success("Suscripción creada")
      queryClient.invalidateQueries({ queryKey: ["subscriptions", companyVerticalId] })
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  })

  const renewMutation = useMutation({
    mutationFn: () =>
      renewSubscription(subscription!.id, {
        currentPeriodStart: periodStart,
        currentPeriodEnd: periodEnd,
      }),
    onSuccess: () => {
      toast.success("Suscripción renovada")
      queryClient.invalidateQueries({ queryKey: ["subscriptions", companyVerticalId] })
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  })

  if (subscriptionQuery.isLoading) return null

  return (
    <section className="rounded-xl border border-border p-4">
      <h3 className="text-sm font-semibold">Suscripción</h3>

      {subscription ? (
        <div className="mt-3 flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <StatusBadge status={subscription.status} />
            <span className="text-sm">{subscription.planCodeSnapshot ?? subscription.planId}</span>
          </div>
          <p className="text-xs text-muted-foreground">
            Periodo: {new Date(subscription.currentPeriodStart).toLocaleDateString("es-CO")} —{" "}
            {new Date(subscription.currentPeriodEnd).toLocaleDateString("es-CO")}
          </p>

          <div className="mt-2 grid grid-cols-2 gap-2">
            <Input type="date" value={periodStart} onChange={(e) => setPeriodStart(e.target.value)} />
            <Input type="date" value={periodEnd} onChange={(e) => setPeriodEnd(e.target.value)} />
          </div>
          <Button
            size="sm"
            variant="outline"
            className="w-fit"
            disabled={renewMutation.isPending}
            onClick={() => renewMutation.mutate()}
          >
            Renovar periodo
          </Button>
        </div>
      ) : (
        <div className="mt-3 flex flex-col gap-2">
          <p className="text-sm text-muted-foreground">Esta empresa aún no tiene suscripción.</p>

          <FormField label="Plan" htmlFor="planId">
            <Select value={planId} onValueChange={setPlanId}>
              <SelectTrigger id="planId">
                <SelectValue placeholder="Selecciona un plan" />
              </SelectTrigger>
              <SelectContent>
                {plansQuery.data?.items.map((plan) => (
                  <SelectItem key={plan.id} value={plan.id}>
                    {plan.name} — {plan.price} {plan.currency}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FormField>

          <div className="grid grid-cols-2 gap-2">
            <Input type="date" value={periodStart} onChange={(e) => setPeriodStart(e.target.value)} />
            <Input type="date" value={periodEnd} onChange={(e) => setPeriodEnd(e.target.value)} />
          </div>

          <Button
            size="sm"
            className="w-fit"
            disabled={!planId || createMutation.isPending}
            onClick={() => createMutation.mutate()}
          >
            Crear suscripción
          </Button>
        </div>
      )}
    </section>
  )
}
