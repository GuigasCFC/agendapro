import { beforeEach, describe, expect, it, vi } from "vitest"

class FakePrismaKnownRequestError extends Error {
  code: string
  constructor(message: string, code: string) {
    super(message)
    this.code = code
  }
}

const requireRoleMock = vi.fn()
const deleteAppointmentMock = vi.fn()

vi.mock("@/lib/db", () => ({ db: {} }))
vi.mock("@/lib/auth/authorize", () => ({
  requireRole: (...args: unknown[]) => requireRoleMock(...args),
}))
vi.mock("./services", () => ({
  deleteAppointment: (...args: unknown[]) => deleteAppointmentMock(...args),
}))
vi.mock("@/lib/generated/prisma/client", () => ({
  Prisma: { PrismaClientKnownRequestError: FakePrismaKnownRequestError },
}))
vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }))

const { deleteAppointment } = await import("./actions")

describe("deleteAppointment (action)", () => {
  beforeEach(() => {
    requireRoleMock.mockReset().mockResolvedValue({ organizationId: "org-1" })
    deleteAppointmentMock.mockReset()
  })

  it("não lança quando o delete falha por FK (agendamento com transação/notificação vinculada)", async () => {
    deleteAppointmentMock.mockRejectedValue(
      new FakePrismaKnownRequestError("Foreign key constraint failed", "P2003")
    )

    await expect(deleteAppointment("appt-1")).resolves.toBeUndefined()
  })

  it("propaga outros erros normalmente", async () => {
    deleteAppointmentMock.mockRejectedValue(new Error("Agendamento não encontrado."))

    await expect(deleteAppointment("appt-1")).rejects.toThrow(/não encontrado/i)
  })
})
