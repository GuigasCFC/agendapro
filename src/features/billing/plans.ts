import "server-only"

import { getStripe } from "@/lib/stripe"
import { getOrCreateStripeCustomer } from "./services"
import { getOrCreateSubscription } from "@/features/subscriptions/services"
import type { SubscriptionPlan } from "@/lib/generated/prisma/client"

export type PaidPlan = Extract<SubscriptionPlan, "PRO" | "PREMIUM">

// Mesmos valores tratados como assinatura Stripe em vigor no PlanPicker
// (features/subscriptions/components/plan-picker.tsx) e no bloqueio de
// downgrade (features/subscriptions/actions.ts).
const ACTIVE_STRIPE_SUBSCRIPTION_STATUSES = new Set([
  "active",
  "trialing",
  "past_due",
  "unpaid",
  "incomplete",
])

function getPriceId(plan: PaidPlan): string {
  const envVar = plan === "PRO" ? "STRIPE_PRICE_ID_PRO" : "STRIPE_PRICE_ID_PREMIUM"
  const priceId = process.env[envVar]
  if (!priceId) throw new Error(`${envVar} não configurada.`)
  return priceId
}

/**
 * Mapeamento inverso (Price ID -> plano), usado pelo webhook para saber
 * qual plano ativar a partir do Price ID retornado pelo Stripe. Nunca
 * identifica o plano pelo valor pago.
 */
export const PLAN_PRICE_IDS: Partial<Record<string, PaidPlan>> = {
  ...(process.env.STRIPE_PRICE_ID_PRO && { [process.env.STRIPE_PRICE_ID_PRO]: "PRO" }),
  ...(process.env.STRIPE_PRICE_ID_PREMIUM && {
    [process.env.STRIPE_PRICE_ID_PREMIUM]: "PREMIUM",
  }),
}

/**
 * Cria a Checkout Session de assinatura no Stripe para o plano pago
 * escolhido e retorna a URL hospedada pelo Stripe onde o pagador informa o
 * cartão e autoriza a cobrança recorrente. A Subscription só é atualizada
 * pelo webhook (checkout.session.completed / customer.subscription.*) —
 * esta função não grava nenhum dado de assinatura localmente.
 */
export async function createStripeCheckoutSession(
  organizationId: string,
  plan: PaidPlan
): Promise<{ url: string }> {
  const subscription = await getOrCreateSubscription(organizationId)
  if (
    subscription.subscriptionStatus &&
    ACTIVE_STRIPE_SUBSCRIPTION_STATUSES.has(subscription.subscriptionStatus)
  ) {
    throw new Error("Sua organização já tem uma assinatura ativa.")
  }

  const customerId = await getOrCreateStripeCustomer(organizationId)
  const appUrl = process.env.NEXT_PUBLIC_APP_URL

  const session = await getStripe().checkout.sessions.create({
    mode: "subscription",
    customer: customerId,
    client_reference_id: organizationId,
    line_items: [{ price: getPriceId(plan), quantity: 1 }],
    success_url: appUrl ? `${appUrl}/subscription` : "https://example.com/subscription",
    cancel_url: appUrl ? `${appUrl}/subscription` : "https://example.com/subscription",
  })

  if (!session.url) {
    throw new Error("Stripe não retornou URL de checkout.")
  }

  return { url: session.url }
}

/**
 * Cria uma sessão do Billing Portal do Stripe, onde a organização gerencia
 * cancelamento, reativação e forma de pagamento sem nenhuma lógica própria
 * — o Portal é a única interface para essas ações.
 */
export async function createBillingPortalSession(organizationId: string): Promise<{ url: string }> {
  const customerId = await getOrCreateStripeCustomer(organizationId)
  const appUrl = process.env.NEXT_PUBLIC_APP_URL

  const session = await getStripe().billingPortal.sessions.create({
    customer: customerId,
    return_url: appUrl ? `${appUrl}/subscription` : "https://example.com/subscription",
  })

  return { url: session.url }
}
