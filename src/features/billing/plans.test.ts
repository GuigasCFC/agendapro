import { beforeEach, describe, expect, it, vi } from "vitest"

process.env.STRIPE_PRICE_ID_PRO = "price_pro"
process.env.STRIPE_PRICE_ID_PREMIUM = "price_premium"
process.env.NEXT_PUBLIC_APP_URL = "https://app.example.com"

const getOrCreateStripeCustomerMock = vi.fn()
const getOrCreateSubscriptionMock = vi.fn()
const checkoutSessionsCreateMock = vi.fn()
const billingPortalSessionsCreateMock = vi.fn()

vi.mock("@/lib/stripe", () => ({
  getStripe: () => ({
    checkout: { sessions: { create: (...args: unknown[]) => checkoutSessionsCreateMock(...args) } },
    billingPortal: { sessions: { create: (...args: unknown[]) => billingPortalSessionsCreateMock(...args) } },
  }),
}))
vi.mock("./services", () => ({
  getOrCreateStripeCustomer: (...args: unknown[]) => getOrCreateStripeCustomerMock(...args),
}))
vi.mock("@/features/subscriptions/services", () => ({
  getOrCreateSubscription: (...args: unknown[]) => getOrCreateSubscriptionMock(...args),
}))

const { PLAN_PRICE_IDS, createStripeCheckoutSession, createBillingPortalSession } =
  await import("./plans")

describe("PLAN_PRICE_IDS (mapeamento inverso Price ID -> plano)", () => {
  it("mapeia cada Price ID configurado para o plano correspondente", () => {
    expect(PLAN_PRICE_IDS["price_pro"]).toBe("PRO")
    expect(PLAN_PRICE_IDS["price_premium"]).toBe("PREMIUM")
  })
})

describe("createStripeCheckoutSession", () => {
  beforeEach(() => {
    getOrCreateStripeCustomerMock.mockReset()
    getOrCreateSubscriptionMock.mockReset().mockResolvedValue({ subscriptionStatus: null })
    checkoutSessionsCreateMock.mockReset()
  })

  it("cria a Checkout Session em modo subscription com o Price ID do plano", async () => {
    getOrCreateStripeCustomerMock.mockResolvedValue("cus-123")
    checkoutSessionsCreateMock.mockResolvedValue({ url: "https://checkout.stripe.com/session-1" })

    const result = await createStripeCheckoutSession("org-1", "PRO")

    expect(result).toEqual({ url: "https://checkout.stripe.com/session-1" })
    expect(checkoutSessionsCreateMock).toHaveBeenCalledWith(
      expect.objectContaining({
        mode: "subscription",
        customer: "cus-123",
        client_reference_id: "org-1",
        line_items: [{ price: "price_pro", quantity: 1 }],
      })
    )
  })

  it("lança erro quando o Stripe não retorna URL", async () => {
    getOrCreateStripeCustomerMock.mockResolvedValue("cus-123")
    checkoutSessionsCreateMock.mockResolvedValue({ url: null })

    await expect(createStripeCheckoutSession("org-1", "PRO")).rejects.toThrow(/URL/i)
  })

  it("rejeita quando a organização já tem assinatura Stripe ativa", async () => {
    getOrCreateSubscriptionMock.mockResolvedValue({ subscriptionStatus: "active" })

    await expect(createStripeCheckoutSession("org-1", "PREMIUM")).rejects.toThrow(/já tem uma assinatura/i)
    expect(getOrCreateStripeCustomerMock).not.toHaveBeenCalled()
    expect(checkoutSessionsCreateMock).not.toHaveBeenCalled()
  })

  it("permite novo checkout quando a assinatura anterior já está cancelada", async () => {
    getOrCreateSubscriptionMock.mockResolvedValue({ subscriptionStatus: "canceled" })
    getOrCreateStripeCustomerMock.mockResolvedValue("cus-123")
    checkoutSessionsCreateMock.mockResolvedValue({ url: "https://checkout.stripe.com/session-2" })

    const result = await createStripeCheckoutSession("org-1", "PRO")

    expect(result).toEqual({ url: "https://checkout.stripe.com/session-2" })
  })
})

describe("createBillingPortalSession", () => {
  beforeEach(() => {
    getOrCreateStripeCustomerMock.mockReset()
    billingPortalSessionsCreateMock.mockReset()
  })

  it("cria a sessão do Billing Portal para o customer da organização", async () => {
    getOrCreateStripeCustomerMock.mockResolvedValue("cus-123")
    billingPortalSessionsCreateMock.mockResolvedValue({ url: "https://billing.stripe.com/session-1" })

    const result = await createBillingPortalSession("org-1")

    expect(result).toEqual({ url: "https://billing.stripe.com/session-1" })
    expect(billingPortalSessionsCreateMock).toHaveBeenCalledWith(
      expect.objectContaining({ customer: "cus-123" })
    )
  })
})
