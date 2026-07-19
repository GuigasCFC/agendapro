import { beforeEach, describe, expect, it, vi } from "vitest"

class FakePrismaKnownRequestError extends Error {
  code: string
  constructor(message: string, code: string) {
    super(message)
    this.code = code
  }
}

const dbMock = {
  $transaction: vi.fn(),
  appointment: { findMany: vi.fn(), findFirst: vi.fn(), create: vi.fn(), updateMany: vi.fn(), deleteMany: vi.fn() },
  service: { findFirst: vi.fn() },
  customer: { findFirst: vi.fn() },
  employee: { findFirst: vi.fn() },
}
const assertWithinLimitMock = vi.fn()

vi.mock("@/lib/db", () => ({ db: dbMock }))
vi.mock("@/lib/generated/prisma/client", () => ({
  Prisma: {
    PrismaClientKnownRequestError: FakePrismaKnownRequestError,
    TransactionIsolationLevel: { Serializable: "Serializable" },
  },
}))
vi.mock("@/features/subscriptions/services", () => ({
  assertWithinLimit: (...args: unknown[]) => assertWithinLimitMock(...args),
}))

const { listAppointments, createAppointment, updateAppointment, deleteAppointment } =
  await import("./services")

const validInput = {
  customerId: "cust-1",
  serviceId: "serv-1",
  employeeId: "emp-1",
  date: "2026-08-01",
  time: "10:00",
  status: "SCHEDULED" as const,
  notes: "",
}

describe("listAppointments", () => {
  it("seleciona só o nome das relações, sem trazer colunas desnecessárias", async () => {
    dbMock.appointment.findMany.mockReset().mockResolvedValue([])

    await listAppointments("org-1")

    const call = dbMock.appointment.findMany.mock.calls[0][0]
    expect(call.include).toEqual({
      customer: { select: { name: true } },
      service: { select: { name: true } },
      employee: { select: { name: true } },
    })
  })
})

describe("createAppointment", () => {
  beforeEach(() => {
    assertWithinLimitMock.mockReset().mockResolvedValue(undefined)
    dbMock.service.findFirst.mockReset()
    dbMock.customer.findFirst.mockReset()
    dbMock.employee.findFirst.mockReset()
    dbMock.appointment.create.mockReset()
    dbMock.appointment.findFirst.mockReset().mockResolvedValue(null)
    dbMock.$transaction.mockReset().mockImplementation((cb: (tx: typeof dbMock) => unknown) => cb(dbMock))
  })

  it("checa o limite de agendamentos do mês antes de criar", async () => {
    dbMock.service.findFirst.mockResolvedValue({ id: "serv-1", durationMin: 30, active: true })
    dbMock.customer.findFirst.mockResolvedValue({ id: "cust-1" })
    dbMock.employee.findFirst.mockResolvedValue({ id: "emp-1", active: true })
    dbMock.appointment.create.mockResolvedValue({ id: "appt-1" })

    await createAppointment(validInput, "org-1")

    expect(assertWithinLimitMock).toHaveBeenCalledWith("org-1", "appointmentsPerMonth")
  })

  it("rejeita quando o serviço não existe na organização", async () => {
    dbMock.service.findFirst.mockResolvedValue(null)
    dbMock.customer.findFirst.mockResolvedValue({ id: "cust-1" })
    dbMock.employee.findFirst.mockResolvedValue({ id: "emp-1", active: true })

    await expect(createAppointment(validInput, "org-1")).rejects.toThrow(/serviço/i)
  })

  it("rejeita quando o serviço está inativo", async () => {
    dbMock.service.findFirst.mockResolvedValue({ id: "serv-1", durationMin: 30, active: false })
    dbMock.customer.findFirst.mockResolvedValue({ id: "cust-1" })
    dbMock.employee.findFirst.mockResolvedValue({ id: "emp-1", active: true })

    await expect(createAppointment(validInput, "org-1")).rejects.toThrow(/inativo/i)
  })

  it("rejeita quando cliente ou funcionário não pertencem à organização (IDOR)", async () => {
    dbMock.service.findFirst.mockResolvedValue({ id: "serv-1", durationMin: 30, active: true })
    dbMock.customer.findFirst.mockResolvedValue(null)
    dbMock.employee.findFirst.mockResolvedValue({ id: "emp-1", active: true })

    await expect(createAppointment(validInput, "org-1")).rejects.toThrow(/cliente ou funcionário/i)
  })

  it("rejeita quando o funcionário está inativo", async () => {
    dbMock.service.findFirst.mockResolvedValue({ id: "serv-1", durationMin: 30, active: true })
    dbMock.customer.findFirst.mockResolvedValue({ id: "cust-1" })
    dbMock.employee.findFirst.mockResolvedValue({ id: "emp-1", active: false })

    await expect(createAppointment(validInput, "org-1")).rejects.toThrow(/funcionário está inativo/i)
  })

  it("calcula endsAt a partir da duração do serviço", async () => {
    dbMock.service.findFirst.mockResolvedValue({ id: "serv-1", durationMin: 45, active: true })
    dbMock.customer.findFirst.mockResolvedValue({ id: "cust-1" })
    dbMock.employee.findFirst.mockResolvedValue({ id: "emp-1", active: true })
    dbMock.appointment.create.mockResolvedValue({ id: "appt-1" })

    await createAppointment(validInput, "org-1")

    const call = dbMock.appointment.create.mock.calls[0][0]
    const diffMinutes = (call.data.endsAt.getTime() - call.data.startsAt.getTime()) / 60_000
    expect(diffMinutes).toBe(45)
  })

  it("cria dentro de uma transação Serializable", async () => {
    dbMock.service.findFirst.mockResolvedValue({ id: "serv-1", durationMin: 30, active: true })
    dbMock.customer.findFirst.mockResolvedValue({ id: "cust-1" })
    dbMock.employee.findFirst.mockResolvedValue({ id: "emp-1", active: true })
    dbMock.appointment.create.mockResolvedValue({ id: "appt-1" })

    await createAppointment(validInput, "org-1")

    expect(dbMock.$transaction).toHaveBeenCalledWith(
      expect.any(Function),
      { isolationLevel: "Serializable" }
    )
  })

  it("rejeita quando o funcionário já tem outro agendamento no mesmo horário", async () => {
    dbMock.service.findFirst.mockResolvedValue({ id: "serv-1", durationMin: 30, active: true })
    dbMock.customer.findFirst.mockResolvedValue({ id: "cust-1" })
    dbMock.employee.findFirst.mockResolvedValue({ id: "emp-1", active: true })
    dbMock.appointment.findFirst.mockResolvedValue({ id: "appt-existing" })

    await expect(createAppointment(validInput, "org-1")).rejects.toThrow(/outro agendamento/i)
  })

  it("checa conflito só entre agendamentos não-cancelados do mesmo funcionário", async () => {
    dbMock.service.findFirst.mockResolvedValue({ id: "serv-1", durationMin: 30, active: true })
    dbMock.customer.findFirst.mockResolvedValue({ id: "cust-1" })
    dbMock.employee.findFirst.mockResolvedValue({ id: "emp-1", active: true })
    dbMock.appointment.create.mockResolvedValue({ id: "appt-1" })

    await createAppointment(validInput, "org-1")

    const call = dbMock.appointment.findFirst.mock.calls[0][0]
    expect(call.where).toMatchObject({
      organizationId: "org-1",
      employeeId: "emp-1",
      status: { not: "CANCELED" },
    })
  })

  it("converte conflito de serialização do Postgres na mensagem amigável de conflito", async () => {
    dbMock.service.findFirst.mockResolvedValue({ id: "serv-1", durationMin: 30, active: true })
    dbMock.customer.findFirst.mockResolvedValue({ id: "cust-1" })
    dbMock.employee.findFirst.mockResolvedValue({ id: "emp-1", active: true })
    dbMock.$transaction.mockRejectedValue(
      new FakePrismaKnownRequestError("Transaction failed due to a write conflict", "P2034")
    )

    await expect(createAppointment(validInput, "org-1")).rejects.toThrow(/outro agendamento/i)
  })
})

describe("updateAppointment / deleteAppointment (escopo por organização)", () => {
  beforeEach(() => {
    dbMock.appointment.updateMany.mockReset()
    dbMock.appointment.deleteMany.mockReset()
    dbMock.appointment.findFirst.mockReset().mockResolvedValue(null)
    dbMock.service.findFirst.mockReset().mockResolvedValue({ id: "serv-1", durationMin: 30, active: true })
    dbMock.customer.findFirst.mockReset().mockResolvedValue({ id: "cust-1" })
    dbMock.employee.findFirst.mockReset().mockResolvedValue({ id: "emp-1", active: true })
    dbMock.$transaction.mockReset().mockImplementation((cb: (tx: typeof dbMock) => unknown) => cb(dbMock))
  })

  it("lança erro ao atualizar agendamento de outra organização (count 0)", async () => {
    dbMock.appointment.updateMany.mockResolvedValue({ count: 0 })

    await expect(
      updateAppointment("appt-1", { ...validInput, id: "appt-1" }, "org-1")
    ).rejects.toThrow(/não encontrado/i)
  })

  it("atualiza normalmente escopado por organizationId", async () => {
    dbMock.appointment.updateMany.mockResolvedValue({ count: 1 })

    await updateAppointment("appt-1", { ...validInput, id: "appt-1" }, "org-1")

    const call = dbMock.appointment.updateMany.mock.calls[0][0]
    expect(call.where).toEqual({ id: "appt-1", organizationId: "org-1" })
  })

  it("exclui o próprio agendamento da checagem de conflito ao atualizar", async () => {
    dbMock.appointment.updateMany.mockResolvedValue({ count: 1 })

    await updateAppointment("appt-1", { ...validInput, id: "appt-1" }, "org-1")

    const call = dbMock.appointment.findFirst.mock.calls[0][0]
    expect(call.where.id).toEqual({ not: "appt-1" })
  })

  it("rejeita atualização quando conflita com outro agendamento do mesmo funcionário", async () => {
    dbMock.appointment.findFirst.mockResolvedValue({ id: "appt-other" })

    await expect(
      updateAppointment("appt-1", { ...validInput, id: "appt-1" }, "org-1")
    ).rejects.toThrow(/outro agendamento/i)
  })

  it("lança erro ao deletar agendamento de outra organização (count 0)", async () => {
    dbMock.appointment.deleteMany.mockResolvedValue({ count: 0 })

    await expect(deleteAppointment("appt-1", "org-1")).rejects.toThrow(/não encontrado/i)
  })
})
