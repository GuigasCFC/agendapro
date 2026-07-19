import { NextResponse, type NextRequest } from "next/server"
import type Stripe from "stripe"
import { db } from "@/lib/db"
import { rateLimit, getClientIp } from "@/lib/rate-limit"
import { getStripe } from "@/lib/stripe"
import { PLAN_PRICE_IDS } from "@/features/billing/plans"
import { log, logError } from "@/lib/logger"
import { Prisma, type SubscriptionStatus } from "@/lib/generated/prisma/client"

const WEBHOOK_PROVIDER = "stripe"

const HANDLED_EVENTS = new Set([
  "checkout.session.completed",
  "customer.subscription.created",
  "customer.subscription.updated",
  "customer.subscription.deleted",
  "invoice.payment_succeeded",
  "invoice.payment_failed",
])

function isDuplicateEventError(error: unknown): boolean {
  return (
    error instanceof Prisma.PrismaClientKnownRequestError &&
    error.code === "P2002" &&
    Array.isArray(error.meta?.target) &&
    (error.meta.target as string[]).includes("eventId")
  )
}

// Mapeia o status bruto da assinatura no Stripe para o enum de status da
// aplicação. Só `active`/`trialing` mantêm o plano pago liberado; qualquer
// outro estado precisa bloquear (nunca fazer upgrade a partir de um webhook).
function mapSubscriptionStatus(stripeStatus: Stripe.Subscription.Status): SubscriptionStatus {
  switch (stripeStatus) {
    case "active":
    case "trialing":
      return "ACTIVE"
    case "canceled":
    case "incomplete_expired":
      return "CANCELED"
    default:
      return "EXPIRED"
  }
}

async function claimEvent(tx: Prisma.TransactionClient, eventId: string) {
  await tx.webhookEvent.create({ data: { provider: WEBHOOK_PROVIDER, eventId } })
}

/**
 * Sincroniza a Subscription local a partir de um objeto de assinatura do
 * Stripe. Usada pelos eventos customer.subscription.* — o plano é sempre
 * resolvido pelo Price ID (nunca pelo valor pago) e o Price ID vem sempre
 * do próprio objeto do Stripe, nunca calculado localmente.
 */
async function syncSubscription(eventId: string, subscription: Stripe.Subscription) {
  const item = subscription.items.data[0]
  const priceId = item?.price.id
  const plan = priceId ? PLAN_PRICE_IDS[priceId] : undefined

  await db.$transaction(async (tx) => {
    await claimEvent(tx, eventId)

    const existing = await tx.subscription.findFirst({
      where: { stripeCustomerId: subscription.customer as string },
    })
    if (!existing) return

    await tx.subscription.update({
      where: { id: existing.id },
      data: {
        stripeSubscriptionId: subscription.id,
        stripePriceId: priceId,
        subscriptionStatus: subscription.status,
        status: mapSubscriptionStatus(subscription.status),
        ...(plan && { plan }),
        ...(item && { currentPeriodEnd: new Date(item.current_period_end * 1000) }),
        canceledAt: subscription.canceled_at ? new Date(subscription.canceled_at * 1000) : null,
      },
    })
  })
}

export async function POST(request: NextRequest) {
  const ip = getClientIp(request.headers)
  if (!rateLimit(`stripe-webhook:${ip}`, 60, 60 * 1000)) {
    return NextResponse.json({ message: "Muitas requisições." }, { status: 429 })
  }

  const signature = request.headers.get("stripe-signature")
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET

  if (!signature || !webhookSecret) {
    return NextResponse.json({ message: "Não autorizado." }, { status: 401 })
  }

  const rawBody = await request.text()

  let event: Stripe.Event
  try {
    event = getStripe().webhooks.constructEvent(rawBody, signature, webhookSecret)
  } catch {
    log("webhook.stripe.rejected", { reason: "invalid_signature" })
    return NextResponse.json({ message: "Não autorizado." }, { status: 401 })
  }

  if (!HANDLED_EVENTS.has(event.type)) {
    return NextResponse.json({ received: true })
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object
        const subscriptionId =
          typeof session.subscription === "string" ? session.subscription : session.subscription?.id
        if (!subscriptionId) break

        const subscription = await getStripe().subscriptions.retrieve(subscriptionId)
        await syncSubscription(event.id, subscription)
        break
      }

      case "customer.subscription.created":
      case "customer.subscription.updated":
      case "customer.subscription.deleted": {
        await syncSubscription(event.id, event.data.object)
        break
      }

      case "invoice.payment_succeeded":
      case "invoice.payment_failed": {
        const invoice = event.data.object
        const customerId = typeof invoice.customer === "string" ? invoice.customer : invoice.customer?.id
        if (!customerId) break

        const subscriptionStatus =
          event.type === "invoice.payment_succeeded" ? "active" : "past_due"

        await db.$transaction(async (tx) => {
          await claimEvent(tx, event.id)

          const existing = await tx.subscription.findFirst({ where: { stripeCustomerId: customerId } })
          if (!existing) return

          await tx.subscription.update({
            where: { id: existing.id },
            data: { subscriptionStatus },
          })
        })
        break
      }
    }
  } catch (error) {
    if (isDuplicateEventError(error)) {
      log("webhook.stripe.duplicate_ignored", { eventId: event.id, eventType: event.type })
      return NextResponse.json({ received: true })
    }
    logError("webhook.stripe.processing_failed", error, { eventId: event.id, eventType: event.type })
    throw error
  }

  log("webhook.stripe.processed", { eventId: event.id, eventType: event.type })

  return NextResponse.json({ received: true })
}
