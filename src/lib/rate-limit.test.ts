import { describe, expect, it, vi, beforeEach, afterEach } from "vitest"
import { rateLimit, getClientIp } from "./rate-limit"

describe("rateLimit (autorização / proteção contra força bruta)", () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(0)
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it("permite requisições dentro do limite", () => {
    const key = `test:${Math.random()}`
    expect(rateLimit(key, 3, 1000)).toBe(true)
    expect(rateLimit(key, 3, 1000)).toBe(true)
    expect(rateLimit(key, 3, 1000)).toBe(true)
  })

  it("bloqueia após exceder o limite", () => {
    const key = `test:${Math.random()}`
    rateLimit(key, 2, 1000)
    rateLimit(key, 2, 1000)
    expect(rateLimit(key, 2, 1000)).toBe(false)
  })

  it("libera novamente depois que a janela expira", () => {
    const key = `test:${Math.random()}`
    rateLimit(key, 1, 1000)
    expect(rateLimit(key, 1, 1000)).toBe(false)

    vi.setSystemTime(1001)
    expect(rateLimit(key, 1, 1000)).toBe(true)
  })

  it("mantém contadores de chaves diferentes isolados", () => {
    const keyA = `test:a:${Math.random()}`
    const keyB = `test:b:${Math.random()}`
    rateLimit(keyA, 1, 1000)
    expect(rateLimit(keyA, 1, 1000)).toBe(false)
    expect(rateLimit(keyB, 1, 1000)).toBe(true)
  })
})

describe("getClientIp", () => {
  it("usa o primeiro IP de x-forwarded-for", () => {
    const headers = new Headers({ "x-forwarded-for": "1.2.3.4, 5.6.7.8" })
    expect(getClientIp(headers)).toBe("1.2.3.4")
  })

  it("cai para x-real-ip quando não há x-forwarded-for", () => {
    const headers = new Headers({ "x-real-ip": "9.9.9.9" })
    expect(getClientIp(headers)).toBe("9.9.9.9")
  })

  it("retorna 'unknown' quando nenhum header está presente", () => {
    const headers = new Headers()
    expect(getClientIp(headers)).toBe("unknown")
  })
})
