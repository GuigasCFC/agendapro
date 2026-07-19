import { describe, expect, it } from "vitest"
import { createServiceSchema } from "./schemas"

describe("createServiceSchema (serviços)", () => {
  it("aceita serviço válido", () => {
    const result = createServiceSchema.safeParse({
      name: "Corte",
      durationMin: 30,
      price: 50,
      active: true,
    })
    expect(result.success).toBe(true)
  })

  it("rejeita duração zero ou negativa", () => {
    expect(
      createServiceSchema.safeParse({ name: "Corte", durationMin: 0, price: 50, active: true })
        .success
    ).toBe(false)
    expect(
      createServiceSchema.safeParse({ name: "Corte", durationMin: -10, price: 50, active: true })
        .success
    ).toBe(false)
  })

  it("rejeita preço não positivo", () => {
    expect(
      createServiceSchema.safeParse({ name: "Corte", durationMin: 30, price: 0, active: true })
        .success
    ).toBe(false)
  })

  it("rejeita duração fracionária", () => {
    expect(
      createServiceSchema.safeParse({ name: "Corte", durationMin: 30.5, price: 50, active: true })
        .success
    ).toBe(false)
  })
})
