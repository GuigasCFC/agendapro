import type { SubscriptionStatus } from "@/lib/generated/prisma/client"

export interface SubscriptionLike {
  status: SubscriptionStatus
  trialEndsAt: Date | null
  currentPeriodEnd: Date | null
}

/**
 * O status salvo no banco não muda sozinho quando um prazo vence (não há
 * job/cron neste projeto). Por isso o status "efetivo" é sempre recalculado
 * a partir das datas na leitura, em vez de confiar apenas no valor salvo.
 */
export function getEffectiveStatus(
  subscription: SubscriptionLike,
  now: Date = new Date()
): SubscriptionStatus {
  if (subscription.status === "CANCELED") return "CANCELED"

  if (subscription.status === "TRIAL") {
    if (subscription.trialEndsAt && now > subscription.trialEndsAt) {
      return "EXPIRED"
    }
    return "TRIAL"
  }

  if (subscription.currentPeriodEnd && now > subscription.currentPeriodEnd) {
    return "EXPIRED"
  }

  return subscription.status === "EXPIRED" ? "EXPIRED" : "ACTIVE"
}

export function isBlockingStatus(status: SubscriptionStatus): boolean {
  return status === "EXPIRED" || status === "CANCELED"
}

export const STATUS_LABELS: Record<SubscriptionStatus, string> = {
  ACTIVE: "Ativa",
  TRIAL: "Período de teste",
  EXPIRED: "Expirada",
  CANCELED: "Cancelada",
}
