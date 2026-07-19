import { describe, expect, it } from "vitest"
import { createAppointmentSchema } from "./schemas"

const base = {
  customerId: "cust-1",
  serviceId: "serv-1",
  employeeId: "emp-1",
  date: "2026-08-01",
  time: "10:00",
  status: "SCHEDULED" as const,
}

describe("createAppointmentSchema (agendamentos)", () => {
  it("aceita agendamento válido", () => {
    expect(createAppointmentSchema.safeParse(base).success).toBe(true)
  })

  it("rejeita sem cliente selecionado", () => {
    expect(createAppointmentSchema.safeParse({ ...base, customerId: "" }).success).toBe(false)
  })

  it("rejeita sem serviço selecionado", () => {
    expect(createAppointmentSchema.safeParse({ ...base, serviceId: "" }).success).toBe(false)
  })

  it("rejeita status fora do enum permitido", () => {
    expect(
      createAppointmentSchema.safeParse({ ...base, status: "INVALID_STATUS" }).success
    ).toBe(false)
  })

  it("aceita todos os status válidos", () => {
    for (const status of ["SCHEDULED", "CONFIRMED", "COMPLETED", "CANCELED", "NO_SHOW"]) {
      expect(createAppointmentSchema.safeParse({ ...base, status }).success).toBe(true)
    }
  })
})
