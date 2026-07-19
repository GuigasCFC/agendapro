"use client"

import { useActionState, useEffect } from "react"
import Link from "next/link"
import { Check } from "lucide-react"
import { toast } from "sonner"

import type { SubscriptionPlan } from "@/lib/generated/prisma/client"
import { selectFreePlan } from "@/features/subscriptions/actions"
import {
  PLAN_LABELS,
  PLAN_LIMITS,
  PLAN_ORDER,
  PLAN_PRICES,
  type LimitResource,
} from "@/features/subscriptions/limits"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

const RESOURCE_ORDER: { key: LimitResource; label: string }[] = [
  { key: "customers", label: "clientes" },
  { key: "employees", label: "funcionários" },
  { key: "services", label: "serviços" },
  { key: "appointmentsPerMonth", label: "agendamentos/mês" },
]

function limitLine(key: LimitResource, label: string, value: number | null) {
  return `${value === null ? "Ilimitado" : `Até ${value}`} ${label}`
}

// Valores brutos do status da assinatura no Stripe (Subscription.status),
// gravados pelo webhook em `subscriptionStatus`.
const PAYMENT_STATUS_LABELS: Record<string, string> = {
  active: "Pagamento aprovado",
  trialing: "Em teste",
  past_due: "Pagamento pendente",
  incomplete: "Pagamento pendente",
  unpaid: "Pagamento recusado",
  canceled: "Assinatura cancelada",
  incomplete_expired: "Assinatura cancelada",
}

// Enquanto o pagamento está ativo/pendente, não faz sentido iniciar um
// novo checkout (evita assinatura duplicada).
const ACTIVE_PAYMENT_STATUSES = new Set(["active", "trialing", "past_due", "unpaid", "incomplete"])

interface PlanPickerProps {
  currentPlan: SubscriptionPlan
  subscriptionStatus: string | null
}

export function PlanPicker({ currentPlan, subscriptionStatus }: PlanPickerProps) {
  const [freeState, freeAction, freePending] = useActionState(selectFreePlan, undefined)

  useEffect(() => {
    if (freeState?.success) toast.success(freeState.message ?? "Plano alterado.")
  }, [freeState])

  const hasActivePaymentSubscription =
    !!subscriptionStatus && ACTIVE_PAYMENT_STATUSES.has(subscriptionStatus)

  return (
    <div className="space-y-3">
      {subscriptionStatus && (
        <p className="text-sm text-muted-foreground">
          Status da assinatura:{" "}
          <span className="font-medium text-foreground">
            {PAYMENT_STATUS_LABELS[subscriptionStatus] ?? subscriptionStatus}
          </span>
        </p>
      )}

      <div className="grid gap-4 sm:grid-cols-3">
        {PLAN_ORDER.map((plan) => {
          const isCurrent = plan === currentPlan
          const isPaid = plan !== "FREE"
          const disablePaidButton =
            isCurrent || (isPaid && hasActivePaymentSubscription)

          return (
            <Card key={plan} className={isCurrent ? "ring-2 ring-primary" : undefined}>
              <CardHeader>
                <div className="flex items-center justify-between gap-2">
                  <CardTitle>{PLAN_LABELS[plan]}</CardTitle>
                  {isCurrent && <Badge>Plano atual</Badge>}
                </div>
                <p className="text-2xl font-semibold tracking-tight text-foreground">
                  {PLAN_PRICES[plan]}
                </p>
              </CardHeader>

              <CardContent>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  {RESOURCE_ORDER.map(({ key, label }) => (
                    <li key={key} className="flex items-start gap-2">
                      <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                      {limitLine(key, label, PLAN_LIMITS[plan][key])}
                    </li>
                  ))}
                </ul>
              </CardContent>

              <CardFooter>
                {plan === "FREE" ? (
                  <form action={freeAction} className="w-full">
                    <Button
                      type="submit"
                      variant={isCurrent ? "outline" : "default"}
                      disabled={isCurrent || freePending}
                      className="w-full"
                    >
                      {isCurrent ? "Plano atual" : "Selecionar Grátis"}
                    </Button>
                  </form>
                ) : (
                  <Button
                    variant={isCurrent ? "outline" : "default"}
                    disabled={disablePaidButton}
                    className="w-full"
                    render={
                      disablePaidButton ? undefined : (
                        <Link href={`/billing/checkout?plan=${plan}`} />
                      )
                    }
                  >
                    {isCurrent ? "Plano atual" : `Assinar ${PLAN_LABELS[plan]}`}
                  </Button>
                )}
              </CardFooter>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
