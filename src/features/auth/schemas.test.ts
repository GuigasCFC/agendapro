import { describe, expect, it } from "vitest"
import { loginSchema, signupSchema } from "./schemas"

describe("loginSchema (autenticação)", () => {
  it("aceita e-mail e senha válidos", () => {
    const result = loginSchema.safeParse({ email: "user@example.com", password: "123456" })
    expect(result.success).toBe(true)
  })

  it("rejeita e-mail inválido", () => {
    const result = loginSchema.safeParse({ email: "not-an-email", password: "123456" })
    expect(result.success).toBe(false)
  })

  it("rejeita senha vazia", () => {
    const result = loginSchema.safeParse({ email: "user@example.com", password: "" })
    expect(result.success).toBe(false)
  })
})

describe("signupSchema (cadastro)", () => {
  it("aceita cadastro válido", () => {
    const result = signupSchema.safeParse({
      organizationName: "Minha Empresa",
      name: "Fulano",
      email: "user@example.com",
      password: "12345678",
    })
    expect(result.success).toBe(true)
  })

  it("rejeita senha curta", () => {
    const result = signupSchema.safeParse({
      organizationName: "Minha Empresa",
      name: "Fulano",
      email: "user@example.com",
      password: "1234567",
    })
    expect(result.success).toBe(false)
  })

  it("rejeita nome de organização muito curto", () => {
    const result = signupSchema.safeParse({
      organizationName: "A",
      name: "Fulano",
      email: "user@example.com",
      password: "12345678",
    })
    expect(result.success).toBe(false)
  })
})
