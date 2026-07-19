import { getActiveMembership } from "@/lib/auth/dal"
import { getSubscriptionSummary } from "@/features/subscriptions/services"
import { CurrentPlanCard } from "@/features/subscriptions/components/current-plan-card"
import { PlanPicker } from "@/features/subscriptions/components/plan-picker"

export default async function SubscriptionPage() {
  const membership = await getActiveMembership()
  const organizationId = membership?.organizationId ?? ""

  const { subscription, status, limits, usage } =
    await getSubscriptionSummary(organizationId)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">
          Assinatura
        </h1>
        <p className="text-sm text-muted-foreground">
          Acompanhe o uso do seu plano e gerencie sua assinatura.
        </p>
      </div>

      <CurrentPlanCard
        plan={subscription.plan}
        status={status}
        trialEndsAt={subscription.trialEndsAt}
        currentPeriodEnd={subscription.currentPeriodEnd}
        usage={usage}
        limits={limits}
        role={membership?.role ?? "MEMBER"}
      />

      <div className="space-y-3">
        <h2 className="text-lg font-semibold tracking-tight text-foreground">
          Planos disponíveis
        </h2>
        <PlanPicker
          currentPlan={subscription.plan}
          subscriptionStatus={subscription.subscriptionStatus}
        />
      </div>
    </div>
  )
}
