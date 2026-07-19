import { beforeEach, describe, expect, it, vi } from "vitest"
import { NextRequest } from "next/server"

class FakePrismaKnownRequestError extends Error {
  code: string
  meta: { target: string[] }
  constructor(message: string, code: string, meta: { target: string[] }) {
    super(message)
    this.code = code
    this.meta = meta
  }
}

const txMock = {
  webhookEvent: { create: vi.fn() },
  subscription: { findFirst: vi.fn(), update: vi.fn() },
}
const dbMock = {
  $transaction: vi.fn((cb: (tx: typeof txMock) => unknown) => cb(txMock)),
}

const constructEventMock = vi.fn()
const subscriptionsRetrieveMock = vi.fn()

vi.mock("@/lib/db", () => ({ db: dbMock }))
vi.mock("@/lib/rate-limit", () => ({
  rateLimit: () => true,
  getClientIp: () => "127.0.0.1",
}))
vi.mock("@/lib/stripe", () => ({
  getStripe: () => ({
    webhooks: { constructEvent: (...args: unknown[]) => constructEventMock(...args) },
    subscriptions: { retrieve: (...args: unknown[]) => subscriptionsRetrieveMock(...args) },
  }),
}))
vi.mock("@/features/billing/plans", () => ({
  PLAN_PRICE_IDS: { price_pro: "PRO", price_premium: "PREMIUM" },
}))
vi.mock("@/lib/generated/prisma/client", () => ({
  Prisma: { PrismaClientKnownRequestError: FakePrismaKnownRequestError },
}))

const { POST } = await import("./route")

function buildRequest(body: unknown) {
  return new NextRequest("http://localhost/api/webhooks/stripe", {
    method: "POST",
    headers: { "stripe-signature": "sig_test" },
    body: JSON.stringify(body),
  })
}

beforeEach(() => {
  process.env.STRIPE_WEBHOOK_SECRET = "whsec_test"
  txMock.webhookEvent.create.mockReset().mockResolvedValue(undefined)
  txMock.subscription.findFirst.mockReset()
  txMock.subscription.update.mockReset()
  dbMock.$transaction.mockClear()
  constructEventMock.mockReset()
  subscriptionsRetrieveMock.mockReset()
})

describe("POST /api/webhooks/stripe", () => {
  it("rejeita quando a assinatura é inválida", async () => {
    constructEventMock.mockImplementation(() => {
      throw new Error("invalid signature")
    })

    const response = await POST(buildRequest({}))

    expect(response.status).toBe(401)
  })

  it("ignora eventos não tratados", async () => {
    constructEventMock.mockReturnValue({ id: "evt_1", type: "payment_intent.succeeded", data: {} })

    const response = await POST(buildRequest({}))

    expect(response.status).toBe(200)
    expect(dbMock.$transaction).not.toHaveBeenCalled()
  })

  it("checkout.session.completed busca a assinatura e sincroniza pelo Price ID", async () => {
    constructEventMock.mockReturnValue({
      id: "evt_1",
      type: "checkout.session.completed",
      data: { object: { subscription: "sub_1" } },
    })
    subscriptionsRetrieveMock.mockResolvedValue({
      id: "sub_1",
      customer: "cus_1",
      status: "active",
      canceled_at: null,
      items: { data: [{ price: { id: "price_pro" }, current_period_end: 1_800_000_000 }] },
    })
    txMock.subscription.findFirst.mockResolvedValue({ id: "row-1" })

    const response = await POST(buildRequest({}))

    expect(response.status).toBe(200)
    expect(txMock.subscription.findFirst).toHaveBeenCalledWith({
      where: { stripeCustomerId: "cus_1" },
    })
    expect(txMock.subscription.update).toHaveBeenCalledWith({
      where: { id: "row-1" },
      data: expect.objectContaining({
        stripeSubscriptionId: "sub_1",
        stripePriceId: "price_pro",
        subscriptionStatus: "active",
        status: "ACTIVE",
        plan: "PRO",
        canceledAt: null,
      }),
    })
  })

  it("customer.subscription.deleted marca CANCELED", async () => {
    constructEventMock.mockReturnValue({
      id: "evt_2",
      type: "customer.subscription.deleted",
      data: {
        object: {
          id: "sub_1",
          customer: "cus_1",
          status: "canceled",
          canceled_at: 1_800_000_000,
          items: { data: [{ price: { id: "price_pro" }, current_period_end: 1_800_000_000 }] },
        },
      },
    })
    txMock.subscription.findFirst.mockResolvedValue({ id: "row-1" })

    await POST(buildRequest({}))

    expect(txMock.subscription.update).toHaveBeenCalledWith({
      where: { id: "row-1" },
      data: expect.objectContaining({ status: "CANCELED", subscriptionStatus: "canceled" }),
    })
  })

  it("invoice.payment_failed marca subscriptionStatus sem alterar o status da assinatura", async () => {
    constructEventMock.mockReturnValue({
      id: "evt_3",
      type: "invoice.payment_failed",
      data: { object: { customer: "cus_1" } },
    })
    txMock.subscription.findFirst.mockResolvedValue({ id: "row-1" })

    await POST(buildRequest({}))

    expect(txMock.subscription.update).toHaveBeenCalledWith({
      where: { id: "row-1" },
      data: { subscriptionStatus: "past_due" },
    })
  })

  it("ignora evento duplicado (idempotência via WebhookEvent) sem lançar erro", async () => {
    constructEventMock.mockReturnValue({
      id: "evt_1",
      type: "customer.subscription.updated",
      data: {
        object: {
          id: "sub_1",
          customer: "cus_1",
          status: "active",
          canceled_at: null,
          items: { data: [{ price: { id: "price_pro" }, current_period_end: 1_800_000_000 }] },
        },
      },
    })
    txMock.webhookEvent.create.mockRejectedValue(
      new FakePrismaKnownRequestError("duplicate", "P2002", { target: ["eventId"] })
    )

    const response = await POST(buildRequest({}))

    expect(response.status).toBe(200)
    expect(txMock.subscription.update).not.toHaveBeenCalled()
  })
})
