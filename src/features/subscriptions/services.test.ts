import { beforeEach, describe, expect, it, vi } from "vitest"

const dbMock = {
  subscription: { findUnique: vi.fn(), create: vi.fn(), update: vi.fn() },
  customer: { count: vi.fn() },
  employee: { count: vi.fn() },
  service: { count: vi.fn() },
  appointment: { count: vi.fn() },
}

vi.mock("@/lib/db", () => ({ db: dbMock }))

const { getOrCreateSubscription, assertWithinLimit, switchToFreePlan, addDays } =
  await import("./services")

describe("addDays", () => {
  it("soma dias preservando o horário", () => {
    const result = addDays(new Date("2026-01-01T10:00:00Z"), 7)
    expect(result.toISOString().slice(0, 10)).toBe("2026-01-08")
  })
})

describe("getOrCreateSubscription", () => {
  beforeEach(() => {
    dbMock.subscription.findUnique.mockReset()
    dbMock.subscription.create.mockReset()
  })

  it("retorna a subscription existente sem criar outra", async () => {
    const existing = { organizationId: "org-1", plan: "PRO", status: "ACTIVE" }
    dbMock.subscription.findUnique.mockResolvedValue(existing)

    const result = await getOrCreateSubscription("org-1")

    expect(result).toBe(existing)
    expect(dbMock.subscription.create).not.toHaveBeenCalled()
  })

  it("cria trial de 7 dias em PRO quando não existe subscription", async () => {
    dbMock.subscription.findUnique.mockResolvedValue(null)
    dbMock.subscription.create.mockResolvedValue({ organizationId: "org-1", plan: "PRO", status: "TRIAL" })

    await getOrCreateSubscription("org-1")

    expect(dbMock.subscription.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ organizationId: "org-1", plan: "PRO", status: "TRIAL" }),
      })
    )
  })
})

describe("assertWithinLimit", () => {
  beforeEach(() => {
    dbMock.subscription.findUnique.mockReset()
    dbMock.customer.count.mockReset()
  })

  it("lança erro quando a assinatura está bloqueada (expirada)", async () => {
    dbMock.subscription.findUnique.mockResolvedValue({
      organizationId: "org-1",
      plan: "FREE",
      status: "EXPIRED",
      trialEndsAt: null,
      currentPeriodEnd: null,
    })

    await expect(assertWithinLimit("org-1", "customers")).rejects.toThrow(/expirou/i)
  })

  it("lança erro ao atingir o limite do plano", async () => {
    dbMock.subscription.findUnique.mockResolvedValue({
      organizationId: "org-1",
      plan: "FREE",
      status: "ACTIVE",
      trialEndsAt: null,
      currentPeriodEnd: null,
    })
    dbMock.customer.count.mockResolvedValue(999999)

    await expect(assertWithinLimit("org-1", "customers")).rejects.toThrow(/limite/i)
  })

  it("não lança erro quando dentro do limite", async () => {
    dbMock.subscription.findUnique.mockResolvedValue({
      organizationId: "org-1",
      plan: "PREMIUM",
      status: "ACTIVE",
      trialEndsAt: null,
      currentPeriodEnd: null,
    })
    dbMock.customer.count.mockResolvedValue(0)

    await expect(assertWithinLimit("org-1", "customers")).resolves.toBeUndefined()
  })
})

describe("switchToFreePlan", () => {
  beforeEach(() => {
    dbMock.subscription.update.mockReset()
  })

  it("switchToFreePlan zera trial e período e ativa o plano FREE", async () => {
    await switchToFreePlan("org-1")

    expect(dbMock.subscription.update).toHaveBeenCalledWith({
      where: { organizationId: "org-1" },
      data: {
        plan: "FREE",
        status: "ACTIVE",
        trialEndsAt: null,
        currentPeriodEnd: null,
        canceledAt: null,
      },
    })
  })
})
