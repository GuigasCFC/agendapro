"use client"

import { useActionState, useEffect } from "react"
import { format } from "date-fns"
import { toast } from "sonner"

import type {
  MembershipRole,
  SubscriptionStatus,
} from "@/lib/generated/prisma/client"
import { openBillingPortal } from "@/features/billing/actions"
import type { SubscriptionActionState } from "@/features/subscriptions/actions"
import { PLAN_LABELS } from "@/features/subscriptions/limits"
import { STATUS_LABELS } from "@/features/subscriptions/status"
import type { UsageCounts } from "@/features/subscriptions/services"
import type { PlanLimits } from "@/features/subscriptions/limits"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { UsageMeter } from "./usage-meter"

const STATUS_BADGE_VARIANT: Record<
  SubscriptionStatus,
  "success" | "info" | "destructive"
> = {
  ACTIVE: "success",
  TRIAL: "info",
  EXPIRED: "destructive",
  CANCELED: "destructive",
}

interface CurrentPlanCardProps {
  plan: keyof typeof PLAN_LABELS
  status: SubscriptionStatus
  trialEndsAt: Date | null
  currentPeriodEnd: Date | null
  usage: UsageCounts
  limits: PlanLimits
  role: MembershipRole
}

export function CurrentPlanCard({
  plan,
  status,
  trialEndsAt,
  currentPeriodEnd,
  usage,
  limits,
  role,
}: CurrentPlanCardProps) {
  const [state, action, pending] = useActionState<SubscriptionActionState>(
    openBillingPortal,
    undefined
  )
  const canManage = role === "OWNER" || role === "ADMIN"

  useEffect(() => {
    if (state?.success) {
      toast.success(state.message ?? "Assinatura atualizada.")
    }
  }, [state])

  const relevantDate = status === "TRIAL" ? trialEndsAt : currentPeriodEnd

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between gap-2">
          <div>
            <CardTitle>Plano {PLAN_LABELS[plan]}</CardTitle>
            <CardDescription>
              Uso atual em relação aos limites do seu plano.
            </CardDescription>
          </div>
          <Badge variant={STATUS_BADGE_VARIANT[status]}>
            {STATUS_LABELS[status]}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-5">
        {relevantDate && (
          <p className="text-sm text-muted-foreground">
            {status === "TRIAL"
              ? "Seu teste gratuito termina em "
              : status === "EXPIRED"
                ? "Seu plano expirou em "
                : "Renova em "}
            <span className="font-medium text-foreground">
              {format(relevantDate, "dd/MM/yyyy")}
            </span>
            .
          </p>
        )}

        <div className="space-y-4">
          <UsageMeter label="Clientes" used={usage.customers} limit={limits.customers} />
          <UsageMeter
            label="Funcionários"
            used={usage.employees}
            limit={limits.employees}
          />
          <UsageMeter label="Serviços" used={usage.services} limit={limits.services} />
          <UsageMeter
            label="Agendamentos neste mês"
            used={usage.appointmentsPerMonth}
            limit={limits.appointmentsPerMonth}
          />
        </div>

        {canManage && status !== "CANCELED" && (
          <form action={action}>
            <Button type="submit" variant="outline" disabled={pending}>
              {pending ? "Cancelando..." : "Cancelar assinatura"}
            </Button>
          </form>
        )}

        {state?.message && !state.success && (
          <p className="text-sm text-destructive">{state.message}</p>
        )}
      </CardContent>
    </Card>
  )
}
