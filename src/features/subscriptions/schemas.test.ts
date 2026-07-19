import { describe, expect, it } from "vitest"
import { paidPlanSchema } from "./schemas"

describe("paidPlanSchema (checkout)", () => {
  it("aceita PRO", () => {
    expect(paidPlanSchema.safeParse({ plan: "PRO" }).success).toBe(true)
  })

  it("aceita PREMIUM", () => {
    expect(paidPlanSchema.safeParse({ plan: "PREMIUM" }).success).toBe(true)
  })

  it("rejeita plano FREE (não é pago, não passa por checkout)", () => {
    expect(paidPlanSchema.safeParse({ plan: "FREE" }).success).toBe(false)
  })

  it("rejeita plano inexistente/arbitrário", () => {
    expect(paidPlanSchema.safeParse({ plan: "ENTERPRISE" }).success).toBe(false)
  })

  it("rejeita ausência de plano", () => {
    expect(paidPlanSchema.safeParse({}).success).toBe(false)
  })
})
