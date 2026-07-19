import { beforeEach, describe, expect, it, vi } from "vitest"

class FakePrismaKnownRequestError extends Error {
  code: string
  constructor(message: string, code: string) {
    super(message)
    this.code = code
  }
}

const requireRoleMock = vi.fn()
const deleteServiceMock = vi.fn()

vi.mock("@/lib/db", () => ({ db: {} }))
vi.mock("@/lib/auth/authorize", () => ({
  requireRole: (...args: unknown[]) => requireRoleMock(...args),
}))
vi.mock("./services", () => ({
  deleteService: (...args: unknown[]) => deleteServiceMock(...args),
}))
vi.mock("@/lib/generated/prisma/client", () => ({
  Prisma: { PrismaClientKnownRequestError: FakePrismaKnownRequestError },
}))
vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }))

const { deleteService } = await import("./actions")

describe("deleteService (action)", () => {
  beforeEach(() => {
    requireRoleMock.mockReset().mockResolvedValue({ organizationId: "org-1" })
    deleteServiceMock.mockReset()
  })

  it("não lança quando o delete falha por FK (serviço com agendamentos vinculados)", async () => {
    deleteServiceMock.mockRejectedValue(
      new FakePrismaKnownRequestError("Foreign key constraint failed", "P2003")
    )

    await expect(deleteService("serv-1")).resolves.toBeUndefined()
  })

  it("propaga outros erros normalmente", async () => {
    deleteServiceMock.mockRejectedValue(new Error("Serviço não encontrado."))

    await expect(deleteService("serv-1")).rejects.toThrow(/não encontrado/i)
  })
})
