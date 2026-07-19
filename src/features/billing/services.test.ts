import { beforeEach, describe, expect, it, vi } from "vitest"

const dbMock = {
  organization: { findUniqueOrThrow: vi.fn() },
  subscription: { update: vi.fn() },
}
const getOrCreateSubscriptionMock = vi.fn()
const getCurrentUserMock = vi.fn()
const customersListMock = vi.fn()
const customersCreateMock = vi.fn()

vi.mock("@/lib/db", () => ({ db: dbMock }))
vi.mock("@/lib/stripe", () => ({
  getStripe: () => ({
    customers: {
      list: (...args: unknown[]) => customersListMock(...args),
      create: (...args: unknown[]) => customersCreateMock(...args),
    },
  }),
}))
vi.mock("@/features/subscriptions/services", () => ({
  getOrCreateSubscription: (...args: unknown[]) => getOrCreateSubscriptionMock(...args),
}))
vi.mock("@/lib/auth/dal", () => ({
  getCurrentUser: (...args: unknown[]) => getCurrentUserMock(...args),
}))

const { getOrCreateStripeCustomer } = await import("./services")

describe("getOrCreateStripeCustomer (nunca duplica cliente)", () => {
  beforeEach(() => {
    dbMock.organization.findUniqueOrThrow.mockReset()
    dbMock.subscription.update.mockReset()
    getOrCreateSubscriptionMock.mockReset()
    getCurrentUserMock.mockReset().mockResolvedValue(null)
    customersListMock.mockReset()
    customersCreateMock.mockReset()
  })

  it("retorna o id salvo sem chamar o Stripe quando já existe stripeCustomerId", async () => {
    getOrCreateSubscriptionMock.mockResolvedValue({
      organizationId: "org-1",
      stripeCustomerId: "cus-123",
    })

    const result = await getOrCreateStripeCustomer("org-1")

    expect(result).toBe("cus-123")
    expect(customersListMock).not.toHaveBeenCalled()
    expect(customersCreateMock).not.toHaveBeenCalled()
  })

  it("usa o e-mail do usuário logado quando a organização não tem e-mail de contato", async () => {
    getOrCreateSubscriptionMock.mockResolvedValue({ organizationId: "org-1", stripeCustomerId: null })
    dbMock.organization.findUniqueOrThrow.mockResolvedValue({
      id: "org-1",
      contactEmail: null,
      tradeName: "Minha Empresa",
      name: "Minha Empresa Ltda",
    })
    getCurrentUserMock.mockResolvedValue({ email: "user@example.com" })
    customersListMock.mockResolvedValue({ data: [] })
    customersCreateMock.mockResolvedValue({ id: "cus-new" })

    const result = await getOrCreateStripeCustomer("org-1")

    expect(result).toBe("cus-new")
    expect(customersListMock).toHaveBeenCalledWith({ email: "user@example.com", limit: 1 })
    expect(customersCreateMock).toHaveBeenCalledWith(
      expect.objectContaining({ email: "user@example.com" }),
      { idempotencyKey: "stripe-customer:org-1" }
    )
  })

  it("cria o Customer sem e-mail quando organização e usuário não têm nenhum", async () => {
    getOrCreateSubscriptionMock.mockResolvedValue({ organizationId: "org-1", stripeCustomerId: null })
    dbMock.organization.findUniqueOrThrow.mockResolvedValue({
      id: "org-1",
      contactEmail: null,
      tradeName: "Minha Empresa",
      name: "Minha Empresa Ltda",
    })
    getCurrentUserMock.mockResolvedValue(null)
    customersCreateMock.mockResolvedValue({ id: "cus-new" })

    const result = await getOrCreateStripeCustomer("org-1")

    expect(result).toBe("cus-new")
    expect(customersListMock).not.toHaveBeenCalled()
    expect(customersCreateMock).toHaveBeenCalledWith(
      expect.objectContaining({ email: undefined, name: "Minha Empresa" }),
      { idempotencyKey: "stripe-customer:org-1" }
    )
  })

  it("reaproveita cliente existente encontrado por busca, sem criar outro", async () => {
    getOrCreateSubscriptionMock.mockResolvedValue({ organizationId: "org-1", stripeCustomerId: null })
    dbMock.organization.findUniqueOrThrow.mockResolvedValue({
      id: "org-1",
      contactEmail: "org@example.com",
      tradeName: "Minha Empresa",
      name: "Minha Empresa Ltda",
    })
    customersListMock.mockResolvedValue({ data: [{ id: "cus-existing" }] })

    const result = await getOrCreateStripeCustomer("org-1")

    expect(result).toBe("cus-existing")
    expect(customersCreateMock).not.toHaveBeenCalled()
    expect(dbMock.subscription.update).toHaveBeenCalledWith({
      where: { organizationId: "org-1" },
      data: { stripeCustomerId: "cus-existing" },
    })
  })

  it("cria cliente novo quando a busca não encontra ninguém", async () => {
    getOrCreateSubscriptionMock.mockResolvedValue({ organizationId: "org-1", stripeCustomerId: null })
    dbMock.organization.findUniqueOrThrow.mockResolvedValue({
      id: "org-1",
      contactEmail: "org@example.com",
      tradeName: "Minha Empresa",
      name: "Minha Empresa Ltda",
    })
    customersListMock.mockResolvedValue({ data: [] })
    customersCreateMock.mockResolvedValue({ id: "cus-new" })

    const result = await getOrCreateStripeCustomer("org-1")

    expect(result).toBe("cus-new")
    expect(customersCreateMock).toHaveBeenCalledWith(
      expect.objectContaining({ email: "org@example.com" }),
      { idempotencyKey: "stripe-customer:org-1" }
    )
  })
})
