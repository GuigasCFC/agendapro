import { beforeEach, describe, expect, it, vi } from "vitest"

class FakePrismaKnownRequestError extends Error {
  code: string
  constructor(message: string, code: string) {
    super(message)
    this.code = code
  }
}

const requireRoleMock = vi.fn()
const deleteCustomerMock = vi.fn()

vi.mock("@/lib/db", () => ({ db: {} }))
vi.mock("@/lib/auth/authorize", () => ({
  requireRole: (...args: unknown[]) => requireRoleMock(...args),
}))
vi.mock("./services", () => ({
  deleteCustomer: (...args: unknown[]) => deleteCustomerMock(...args),
}))
vi.mock("@/lib/generated/prisma/client", () => ({
  Prisma: { PrismaClientKnownRequestError: FakePrismaKnownRequestError },
}))
vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }))

const { deleteCustomer } = await import("./actions")

describe("deleteCustomer (action)", () => {
  beforeEach(() => {
    requireRoleMock.mockReset().mockResolvedValue({ organizationId: "org-1" })
    deleteCustomerMock.mockReset()
  })

  it("não lança quando o delete falha por FK (cliente com agendamentos/transações vinculados)", async () => {
    deleteCustomerMock.mockRejectedValue(
      new FakePrismaKnownRequestError("Foreign key constraint failed", "P2003")
    )

    await expect(deleteCustomer("cust-1")).resolves.toBeUndefined()
  })

  it("propaga outros erros normalmente", async () => {
    deleteCustomerMock.mockRejectedValue(new Error("Cliente não encontrado."))

    await expect(deleteCustomer("cust-1")).rejects.toThrow(/não encontrado/i)
  })
})
