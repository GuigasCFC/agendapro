import { beforeEach, describe, expect, it, vi } from "vitest"

const dbMock = {
  appointment: { count: vi.fn(), findMany: vi.fn(), groupBy: vi.fn() },
  customer: { count: vi.fn() },
  transaction: { aggregate: vi.fn(), findMany: vi.fn() },
  service: { count: vi.fn() },
}

vi.mock("@/lib/db", () => ({ db: dbMock }))

const { getDashboardStats, getAppointmentsSummary } = await import("./services")

describe("getDashboardStats", () => {
  beforeEach(() => {
    dbMock.appointment.count.mockReset().mockResolvedValue(3)
    dbMock.customer.count.mockReset().mockResolvedValue(10)
    dbMock.transaction.aggregate.mockReset().mockResolvedValue({ _sum: { amount: null } })
    dbMock.service.count.mockReset().mockResolvedValue(5)
  })

  it("usa 0 como receita do mês quando não há transações", async () => {
    const stats = await getDashboardStats("org-1")
    expect(stats.revenueThisMonth).toBe(0)
  })

  it("converte o valor agregado (Decimal-like) para number", async () => {
    dbMock.transaction.aggregate.mockResolvedValue({ _sum: { amount: 1234.5 } })
    const stats = await getDashboardStats("org-1")
    expect(stats.revenueThisMonth).toBe(1234.5)
  })

  it("repassa as contagens de agendamentos hoje, clientes e serviços ativos", async () => {
    const stats = await getDashboardStats("org-1")
    expect(stats.appointmentsToday).toBe(3)
    expect(stats.customersCount).toBe(10)
    expect(stats.activeServicesCount).toBe(5)
  })
})

describe("getAppointmentsSummary", () => {
  it("preenche todos os status com 0 quando não há agendamentos daquele status", async () => {
    dbMock.appointment.groupBy.mockResolvedValue([{ status: "SCHEDULED", _count: { _all: 4 } }])

    const summary = await getAppointmentsSummary("org-1")

    expect(summary).toEqual({
      SCHEDULED: 4,
      CONFIRMED: 0,
      COMPLETED: 0,
      CANCELED: 0,
      NO_SHOW: 0,
    })
  })
})
