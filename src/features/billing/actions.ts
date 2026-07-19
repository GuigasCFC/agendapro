"use server"

import { redirect } from "next/navigation"
import { headers } from "next/headers"
import { requireRole } from "@/lib/auth/authorize"
import { rateLimit } from "@/lib/rate-limit"
import { paidPlanSchema } from "@/features/subscriptions/schemas"
import type { SubscriptionActionState } from "@/features/subscriptions/actions"
import { logError } from "@/lib/logger"
import { createStripeCheckoutSession, createBillingPortalSession } from "./plans"

/**
 * Inicia o checkout de assinatura: cria a Checkout Session no Stripe e
 * redireciona para a URL hospedada por eles.
 *
 * Esta rota é acionada por uma navegação GET (não uma Server Action POST),
 * então não tem a proteção de Origin do Next para Server Actions. O
 * Sec-Fetch-Site do fetch metadata cobre isso: navegação same-origin (clique
 * no botão) ou digitação direta da URL ("none") são aceitas; qualquer coisa
 * disparada por outro site (CSRF via <img>/<iframe>/link externo) é rejeitada.
 */
export async function startStripeCheckout(plan: string): Promise<never> {
  const membership = await requireRole("ADMIN")

  const secFetchSite = (await headers()).get("sec-fetch-site")
  if (secFetchSite !== "same-origin" && secFetchSite !== "none") {
    throw new Error("Requisição não permitida.")
  }

  if (!rateLimit(`checkout:${membership.organizationId}`, 5, 10 * 60 * 1000)) {
    throw new Error("Muitas tentativas de checkout. Tente novamente em alguns minutos.")
  }

  const validated = paidPlanSchema.safeParse({ plan })
  if (!validated.success) {
    throw new Error("Plano inválido.")
  }

  let session: { url: string }
  try {
    session = await createStripeCheckoutSession(membership.organizationId, validated.data.plan)
  } catch (error) {
    logError("billing.checkout_failed", error, { organizationId: membership.organizationId })
    throw error
  }

  redirect(session.url)
}

/**
 * Abre o Billing Portal do Stripe, onde a organização cancela, reativa ou
 * troca a forma de pagamento da assinatura.
 */
export async function openBillingPortal(
  _state: SubscriptionActionState
): Promise<never> {
  const membership = await requireRole("ADMIN")

  let session: { url: string }
  try {
    session = await createBillingPortalSession(membership.organizationId)
  } catch (error) {
    logError("billing.portal_failed", error, { organizationId: membership.organizationId })
    throw error
  }

  redirect(session.url)
}
