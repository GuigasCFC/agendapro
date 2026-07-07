import { db } from "@/lib/db"
import type { CreateAppointmentInput, UpdateAppointmentInput } from "./schemas"

export function listAppointments(organizationId: string) {
  return db.appointment.findMany({
    where: { organizationId },
    include: { customer: true, service: true, employee: true },
    orderBy: { startsAt: "desc" },
  })
}

export function getAppointment(id: string, organizationId: string) {
  return db.appointment.findFirst({
    where: { id, organizationId },
  })
}

async function resolveSchedule(
  organizationId: string,
  serviceId: string,
  date: string,
  time: string
) {
  const service = await db.service.findFirst({
    where: { id: serviceId, organizationId },
  })

  if (!service) {
    throw new Error("Serviço não encontrado.")
  }

  const startsAt = new Date(`${date}T${time}`)
  const endsAt = new Date(startsAt.getTime() + service.durationMin * 60_000)

  return { startsAt, endsAt }
}

async function assertRelatedEntitiesBelongToOrg(
  organizationId: string,
  customerId: string,
  employeeId: string
) {
  const [customer, employee] = await Promise.all([
    db.customer.findFirst({ where: { id: customerId, organizationId } }),
    db.employee.findFirst({ where: { id: employeeId, organizationId } }),
  ])

  if (!customer || !employee) {
    throw new Error("Cliente ou funcionário não encontrado.")
  }
}

export async function createAppointment(
  data: CreateAppointmentInput,
  organizationId: string
) {
  await assertRelatedEntitiesBelongToOrg(
    organizationId,
    data.customerId,
    data.employeeId
  )

  const { startsAt, endsAt } = await resolveSchedule(
    organizationId,
    data.serviceId,
    data.date,
    data.time
  )

  return db.appointment.create({
    data: {
      organizationId,
      customerId: data.customerId,
      serviceId: data.serviceId,
      employeeId: data.employeeId,
      startsAt,
      endsAt,
      status: data.status,
      notes: data.notes || null,
    },
  })
}

export async function updateAppointment(
  id: string,
  data: UpdateAppointmentInput,
  organizationId: string
) {
  await assertRelatedEntitiesBelongToOrg(
    organizationId,
    data.customerId,
    data.employeeId
  )

  const { startsAt, endsAt } = await resolveSchedule(
    organizationId,
    data.serviceId,
    data.date,
    data.time
  )

  const { count } = await db.appointment.updateMany({
    where: { id, organizationId },
    data: {
      customerId: data.customerId,
      serviceId: data.serviceId,
      employeeId: data.employeeId,
      startsAt,
      endsAt,
      status: data.status,
      notes: data.notes || null,
    },
  })

  if (count === 0) {
    throw new Error("Agendamento não encontrado.")
  }
}

export async function deleteAppointment(id: string, organizationId: string) {
  const { count } = await db.appointment.deleteMany({
    where: { id, organizationId },
  })

  if (count === 0) {
    throw new Error("Agendamento não encontrado.")
  }
}
