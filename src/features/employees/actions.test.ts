import { beforeEach, describe, expect, it, vi } from "vitest"

class FakePrismaKnownRequestError extends Error {
  code: string
  constructor(message: string, code: string) {
    super(message)
    this.code = code
  }
}

const requireRoleMock = vi.fn()
const deleteEmployeeMock = vi.fn()

vi.mock("@/lib/db", () => ({ db: {} }))
vi.mock("@/lib/auth/authorize", () => ({
  requireRole: (...args: unknown[]) => requireRoleMock(...args),
}))
vi.mock("./services", () => ({
  deleteEmployee: (...args: unknown[]) => deleteEmployeeMock(...args),
}))
vi.mock("@/lib/generated/prisma/client", () => ({
  Prisma: { PrismaClientKnownRequestError: FakePrismaKnownRequestError },
}))
vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }))

const { deleteEmployee } = await import("./actions")

describe("deleteEmployee (action)", () => {
  beforeEach(() => {
    requireRoleMock.mockReset().mockResolvedValue({ organizationId: "org-1" })
    deleteEmployeeMock.mockReset()
  })

  it("não lança quando o delete falha por FK (funcionário com agendamentos vinculados)", async () => {
    deleteEmployeeMock.mockRejectedValue(
      new FakePrismaKnownRequestError("Foreign key constraint failed", "P2003")
    )

    await expect(deleteEmployee("emp-1")).resolves.toBeUndefined()
  })

  it("propaga outros erros normalmente", async () => {
    deleteEmployeeMock.mockRejectedValue(new Error("Funcionário não encontrado."))

    await expect(deleteEmployee("emp-1")).rejects.toThrow(/não encontrado/i)
  })
})
