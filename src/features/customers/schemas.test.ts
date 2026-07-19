import { describe, expect, it } from "vitest"
import { createCustomerSchema } from "./schemas"

describe("createCustomerSchema (criação de clientes)", () => {
  it("aceita cliente só com nome (demais campos opcionais)", () => {
    expect(createCustomerSchema.safeParse({ name: "Maria" }).success).toBe(true)
  })

  it("rejeita nome muito curto", () => {
    expect(createCustomerSchema.safeParse({ name: "M" }).success).toBe(false)
  })

  it("rejeita e-mail em formato inválido quando informado", () => {
    const result = createCustomerSchema.safeParse({ name: "Maria", email: "invalido" })
    expect(result.success).toBe(false)
  })

  it("aceita e-mail vazio (campo opcional representado como string vazia)", () => {
    const result = createCustomerSchema.safeParse({ name: "Maria", email: "" })
    expect(result.success).toBe(true)
  })
})
