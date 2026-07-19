import { describe, expect, it } from "vitest"
import { createEmployeeSchema } from "./schemas"

describe("createEmployeeSchema (funcionários)", () => {
  it("aceita funcionário válido", () => {
    const result = createEmployeeSchema.safeParse({ name: "João", role: "Barbeiro", active: true })
    expect(result.success).toBe(true)
  })

  it("rejeita nome muito curto", () => {
    expect(createEmployeeSchema.safeParse({ name: "J", active: true }).success).toBe(false)
  })

  it("faz coerce de string para boolean em active", () => {
    const result = createEmployeeSchema.safeParse({ name: "João", active: "true" })
    expect(result.success).toBe(true)
    expect(result.success && result.data.active).toBe(true)
  })
})
