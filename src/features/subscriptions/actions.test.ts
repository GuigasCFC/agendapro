import { beforeEach, describe, expect, it, vi } from "vitest"

const requireRoleMock = vi.fn()
const getOrCreateSubscriptionMock = vi.fn()
const switchToFreePlanMock = vi.fn()

vi.mock("@/lib/auth/authorize", () => ({
  requireRole: (...args: unknown[]) => requireRoleMock(...args),
}))
vi.mock("./services", () => ({
  getOrCreateSubscription: (...args: unknown[]) => getOrCreateSubscriptionMock(...args),
  switchToFreePlan: (...args: unknown[]) => switchToFreePlanMock(...args),
}))
vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }))

const { selectFreePlan } = await import("./actions")

describe("selectFreePlan", () => {
  beforeEach(() => {
    requireRoleMock.mockReset().mockResolvedValue({ organizationId: "org-1" })
    getOrCreateSubscriptionMock.mockReset()
    switchToFreePlanMock.mockReset()
  })

  it("bloqueia a troca pra Grátis quando há assinatura Stripe ativa", async () => {
    getOrCreateSubscriptionMock.mockResolvedValue({
      organizationId: "org-1",
      subscriptionStatus: "active",
    })

    const result = await selectFreePlan(undefined)

    expect(result?.success).toBeUndefined()
    expect(result?.message).toMatch(/portal/i)
    expect(switchToFreePlanMock).not.toHaveBeenCalled()
  })

  it("permite a troca pra Grátis quando não há assinatura Stripe em vigor", async () => {
    getOrCreateSubscriptionMock.mockResolvedValue({
      organizationId: "org-1",
      subscriptionStatus: null,
    })

    const result = await selectFreePlan(undefined)

    expect(result?.success).toBe(true)
    expect(switchToFreePlanMock).toHaveBeenCalledWith("org-1")
  })

  it("permite a troca pra Grátis quando a assinatura Stripe já está cancelada", async () => {
    getOrCreateSubscriptionMock.mockResolvedValue({
      organizationId: "org-1",
      subscriptionStatus: "canceled",
    })

    const result = await selectFreePlan(undefined)

    expect(result?.success).toBe(true)
    expect(switchToFreePlanMock).toHaveBeenCalledWith("org-1")
  })
})
