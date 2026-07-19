import { beforeEach, describe, expect, it, vi } from "vitest"

const dbMock = {
  service: { findMany: vi.fn(), findFirst: vi.fn(), create: vi.fn(), updateMany: vi.fn(), deleteMany: vi.fn() },
}
const assertWithinLimitMock = vi.fn()

vi.mock("@/lib/db", () => ({ db: dbMock }))
vi.mock("@/features/subscriptions/services", () => ({
  assertWithinLimit: (...args: unknown[]) => assertWithinLimitMock(...args),
}))

const { createService, updateService, deleteService } = await import("./services")

describe("services/services (catálogo de serviços)", () => {
  beforeEach(() => {
    assertWithinLimitMock.mockReset().mockResolvedValue(undefined)
    dbMock.service.create.mockReset()
    dbMock.service.updateMany.mockReset()
    dbMock.service.deleteMany.mockReset()
  })

  it("createService checa o limite de serviços do plano antes de criar", async () => {
    dbMock.service.create.mockResolvedValue({ id: "serv-1" })

    await createService("org-1", { name: "Corte", durationMin: 30, price: 50, active: true })

    expect(assertWithinLimitMock).toHaveBeenCalledWith("org-1", "services")
  })

  it("updateService lança erro quando o serviço é de outra organização", async () => {
    dbMock.service.updateMany.mockResolvedValue({ count: 0 })

    await expect(
      updateService("serv-1", "org-1", { id: "serv-1", name: "Corte", durationMin: 30, price: 50, active: true })
    ).rejects.toThrow(/não encontrado/i)
  })

  it("deleteService escopa a exclusão por organizationId", async () => {
    dbMock.service.deleteMany.mockResolvedValue({ count: 1 })

    await deleteService("serv-1", "org-1")

    expect(dbMock.service.deleteMany).toHaveBeenCalledWith({
      where: { id: "serv-1", organizationId: "org-1" },
    })
  })
})
