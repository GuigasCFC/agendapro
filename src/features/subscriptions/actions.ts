"use server"

import { revalidatePath } from "next/cache"
import { requireRole } from "@/lib/auth/authorize"
import * as subscriptionsService from "./services"

export type SubscriptionActionState =
  | {
      errors?: Record<string, string[] | undefined>
      message?: string
      success?: boolean
    }
  | undefined

// Mesmos valores de subscriptionStatus tratados como assinatura Stripe em
// vigor no PlanPicker (features/subscriptions/components/plan-picker.tsx).
// Nesse estado, o cancelamento precisa passar pelo Billing Portal — trocar
// o plano local pra FREE aqui deixaria a organização sendo cobrada no
// Stripe e presa nos limites do FREE no app.
const ACTIVE_STRIPE_SUBSCRIPTION_STATUSES = new Set([
  "active",
  "trialing",
  "past_due",
  "unpaid",
  "incomplete",
])

export async function selectFreePlan(
  _state: SubscriptionActionState
): Promise<SubscriptionActionState> {
  const membership = await requireRole("ADMIN")

  const subscription = await subscriptionsService.getOrCreateSubscription(
    membership.organizationId
  )

  if (
    subscription.subscriptionStatus &&
    ACTIVE_STRIPE_SUBSCRIPTION_STATUSES.has(subscription.subscriptionStatus)
  ) {
    return {
      message:
        "Você tem uma assinatura paga ativa. Cancele-a pelo Portal de cobrança antes de mudar para o plano Grátis.",
    }
  }

  await subscriptionsService.switchToFreePlan(membership.organizationId)

  revalidatePath("/subscription")
  return { success: true, message: "Plano alterado para Grátis." }
}
