import { beforeEach, describe, expect, it, vi } from "vitest"

const dbMock = {
  employee: { findMany: vi.fn(), findFirst: vi.fn(), create: vi.fn(), updateMany: vi.fn(), deleteMany: vi.fn() },
}
const assertWithinLimitMock = vi.fn()

vi.mock("@/lib/db", () => ({ db: dbMock }))
vi.mock("@/features/subscriptions/services", () => ({
  assertWithinLimit: (...args: unknown[]) => assertWithinLimitMock(...args),
}))

const { createEmployee, updateEmployee, deleteEmployee } = await import("./services")

describe("employees/services", () => {
  beforeEach(() => {
    assertWithinLimitMock.mockReset().mockResolvedValue(undefined)
    dbMock.employee.create.mockReset()
    dbMock.employee.updateMany.mockReset()
    dbMock.employee.deleteMany.mockReset()
  })

  it("createEmployee checa o limite de funcionários do plano antes de criar", async () => {
    dbMock.employee.create.mockResolvedValue({ id: "emp-1" })

    await createEmployee({ name: "João", role: "", active: true }, "org-1")

    expect(assertWithinLimitMock).toHaveBeenCalledWith("org-1", "employees")
  })

  it("updateEmployee lança erro quando o funcionário é de outra organização", async () => {
    dbMock.employee.updateMany.mockResolvedValue({ count: 0 })

    await expect(
      updateEmployee("emp-1", { id: "emp-1", name: "João", role: "", active: true }, "org-1")
    ).rejects.toThrow(/não encontrado/i)
  })

  it("deleteEmployee escopa a exclusão por organizationId", async () => {
    dbMock.employee.deleteMany.mockResolvedValue({ count: 1 })

    await deleteEmployee("emp-1", "org-1")

    expect(dbMock.employee.deleteMany).toHaveBeenCalledWith({
      where: { id: "emp-1", organizationId: "org-1" },
    })
  })
})
