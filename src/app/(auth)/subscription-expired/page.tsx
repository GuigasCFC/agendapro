import Link from "next/link"
import { AlertTriangle } from "lucide-react"
import { format } from "date-fns"

import { getActiveMembership } from "@/lib/auth/dal"
import { logout } from "@/features/auth/actions"
import { getSubscriptionSummary } from "@/features/subscriptions/services"
import { STATUS_LABELS } from "@/features/subscriptions/status"
import { Button } from "@/components/ui/button"

export default async function SubscriptionExpiredPage() {
  const membership = await getActiveMembership()
  const organizationId = membership?.organizationId ?? ""
  const { subscription, status } = await getSubscriptionSummary(organizationId)

  const expiredAt = subscription.trialEndsAt ?? subscription.currentPeriodEnd

  return (
    <div className="space-y-6 text-center">
      <div className="flex justify-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10 text-destructive">
          <AlertTriangle className="h-6 w-6" />
        </div>
      </div>

      <div className="space-y-1">
        <h1 className="text-lg font-semibold">
          {status === "CANCELED" ? "Assinatura cancelada" : "Seu plano expirou"}
        </h1>
        <p className="text-sm text-muted-foreground">
          {expiredAt
            ? `${STATUS_LABELS[status]} desde ${format(expiredAt, "dd/MM/yyyy")}. `
            : ""}
          Escolha um plano para continuar usando o AgendaPro.
        </p>
      </div>

      <div className="space-y-2">
        <Button render={<Link href="/subscription" />} className="w-full">
          Ver planos
        </Button>

        <form action={logout}>
          <Button type="submit" variant="outline" className="w-full">
            Sair
          </Button>
        </form>
      </div>
    </div>
  )
}
