import { describe, expect, it, vi, beforeEach } from "vitest"

const redirectMock = vi.fn((path: string) => {
  throw new Error(`REDIRECT:${path}`)
})
const getActiveMembershipMock = vi.fn()

vi.mock("next/navigation", () => ({
  redirect: (path: string) => redirectMock(path),
}))

vi.mock("./dal", () => ({
  getActiveMembership: () => getActiveMembershipMock(),
}))

const { requireRole } = await import("./authorize")

describe("requireRole (controle de acesso / privilege escalation)", () => {
  beforeEach(() => {
    redirectMock.mockClear()
    getActiveMembershipMock.mockReset()
  })

  it("permite quando o papel do membership é igual ao mínimo exigido", async () => {
    getActiveMembershipMock.mockResolvedValue({ organizationId: "org1", role: "ADMIN" })
    const membership = await requireRole("ADMIN")
    expect(membership.role).toBe("ADMIN")
    expect(redirectMock).not.toHaveBeenCalled()
  })

  it("permite quando o papel do membership é maior que o mínimo exigido", async () => {
    getActiveMembershipMock.mockResolvedValue({ organizationId: "org1", role: "OWNER" })
    const membership = await requireRole("ADMIN")
    expect(membership.role).toBe("OWNER")
    expect(redirectMock).not.toHaveBeenCalled()
  })

  it("redireciona quando o papel do membership é menor que o mínimo exigido", async () => {
    getActiveMembershipMock.mockResolvedValue({ organizationId: "org1", role: "MEMBER" })
    await expect(requireRole("ADMIN")).rejects.toThrow("REDIRECT:/dashboard")
    expect(redirectMock).toHaveBeenCalledWith("/dashboard")
  })

  it("redireciona quando não há membership ativo", async () => {
    getActiveMembershipMock.mockResolvedValue(null)
    await expect(requireRole("MEMBER")).rejects.toThrow("REDIRECT:/dashboard")
    expect(redirectMock).toHaveBeenCalledWith("/dashboard")
  })
})
