import { beforeEach, describe, expect, it, vi } from "vitest"

const dbMock = {
  customer: { findMany: vi.fn(), findFirst: vi.fn(), create: vi.fn(), updateMany: vi.fn(), deleteMany: vi.fn() },
}
const assertWithinLimitMock = vi.fn()

vi.mock("@/lib/db", () => ({ db: dbMock }))
vi.mock("@/features/subscriptions/services", () => ({
  assertWithinLimit: (...args: unknown[]) => assertWithinLimitMock(...args),
}))

const { createCustomer, updateCustomer, deleteCustomer } = await import("./services")

describe("customers/services", () => {
  beforeEach(() => {
    assertWithinLimitMock.mockReset().mockResolvedValue(undefined)
    dbMock.customer.create.mockReset()
    dbMock.customer.updateMany.mockReset()
    dbMock.customer.deleteMany.mockReset()
  })

  it("createCustomer checa o limite de clientes do plano antes de criar", async () => {
    dbMock.customer.create.mockResolvedValue({ id: "cust-1" })

    await createCustomer("org-1", { name: "Maria", email: "", phone: "", notes: "" })

    expect(assertWithinLimitMock).toHaveBeenCalledWith("org-1", "customers")
  })

  it("updateCustomer lança erro quando o cliente é de outra organização", async () => {
    dbMock.customer.updateMany.mockResolvedValue({ count: 0 })

    await expect(
      updateCustomer("org-1", { id: "cust-1", name: "Maria", email: "", phone: "", notes: "" })
    ).rejects.toThrow(/não encontrado/i)
  })

  it("deleteCustomer escopa a exclusão por organizationId", async () => {
    dbMock.customer.deleteMany.mockResolvedValue({ count: 1 })

    await deleteCustomer("org-1", "cust-1")

    expect(dbMock.customer.deleteMany).toHaveBeenCalledWith({
      where: { id: "cust-1", organizationId: "org-1" },
    })
  })
})
