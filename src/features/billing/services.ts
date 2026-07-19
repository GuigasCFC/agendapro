import { db } from "@/lib/db"
import { getStripe } from "@/lib/stripe"
import { getOrCreateSubscription } from "@/features/subscriptions/services"
import { getCurrentUser } from "@/lib/auth/dal"

/**
 * Garante que a Organization tenha um Customer correspondente no Stripe.
 * Idempotente: se `stripeCustomerId` já existir na Subscription, apenas
 * retorna. Busca por e-mail antes de criar para nunca duplicar o cliente.
 *
 * E-mail não é obrigatório para o Stripe. Usa, nesta ordem, o e-mail da
 * Organization, depois o do usuário logado; sem nenhum dos dois, cria o
 * Customer mesmo assim (sem busca por e-mail, já que não há o que buscar).
 */
export async function getOrCreateStripeCustomer(organizationId: string): Promise<string> {
  const subscription = await getOrCreateSubscription(organizationId)

  if (subscription.stripeCustomerId) {
    return subscription.stripeCustomerId
  }

  const organization = await db.organization.findUniqueOrThrow({
    where: { id: organizationId },
  })

  const email = organization.contactEmail || (await getCurrentUser())?.email || undefined

  const stripe = getStripe()

  const existing = email ? await stripe.customers.list({ email, limit: 1 }) : undefined
  const customerId =
    existing?.data[0]?.id ??
    (
      await stripe.customers.create(
        {
          email,
          name: organization.tradeName || organization.name,
        },
        // Estável por organização: chamadas concorrentes/repetidas (duplo
        // clique, retry) resolvem pro mesmo Customer em vez de criar outro.
        { idempotencyKey: `stripe-customer:${organizationId}` }
      )
    ).id

  await db.subscription.update({
    where: { organizationId },
    data: { stripeCustomerId: customerId },
  })

  return customerId
}
