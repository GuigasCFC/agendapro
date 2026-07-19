import { db } from "@/lib/db"
import { Prisma } from "@/lib/generated/prisma/client"
import { assertWithinLimit } from "@/features/subscriptions/services"
import type { CreateAppointmentInput, UpdateAppointmentInput } from "./schemas"

type DbClient = typeof db | Prisma.TransactionClient

export function listAppointments(organizationId: string) {
  return db.appointment.findMany({
    where: { organizationId },
    include: {
      customer: { select: { name: true } },
      service: { select: { name: true } },
      employee: { select: { name: true } },
    },
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

  if (!service.active) {
    throw new Error("Este serviço está inativo.")
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

  if (!employee.active) {
    throw new Error("Este funcionário está inativo.")
  }
}

// Impede dois agendamentos sobrepostos para o mesmo funcionário.
// Agendamentos cancelados liberam o horário de volta.
async function assertNoScheduleConflict(
  client: DbClient,
  organizationId: string,
  employeeId: string,
  startsAt: Date,
  endsAt: Date,
  excludeAppointmentId?: string
) {
  const conflict = await client.appointment.findFirst({
    where: {
      organizationId,
      employeeId,
      status: { not: "CANCELED" },
      ...(excludeAppointmentId && { id: { not: excludeAppointmentId } }),
      startsAt: { lt: endsAt },
      endsAt: { gt: startsAt },
    },
  })

  if (conflict) {
    throw new Error("Este funcionário já possui outro agendamento nesse horário.")
  }
}

function isSerializationConflict(error: unknown): boolean {
  return error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2034"
}

const SCHEDULE_CONFLICT_MESSAGE = "Este funcionário já possui outro agendamento nesse horário."

export async function createAppointment(
  data: CreateAppointmentInput,
  organizationId: string
) {
  await assertWithinLimit(organizationId, "appointmentsPerMonth")

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

  try {
    return await db.$transaction(
      async (tx) => {
        await assertNoScheduleConflict(tx, organizationId, data.employeeId, startsAt, endsAt)

        return tx.appointment.create({
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
      },
      { isolationLevel: Prisma.TransactionIsolationLevel.Serializable }
    )
  } catch (error) {
    if (isSerializationConflict(error)) {
      throw new Error(SCHEDULE_CONFLICT_MESSAGE)
    }
    throw error
  }
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

  let count: number
  try {
    count = await db.$transaction(
      async (tx) => {
        await assertNoScheduleConflict(tx, organizationId, data.employeeId, startsAt, endsAt, id)

        const result = await tx.appointment.updateMany({
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

        return result.count
      },
      { isolationLevel: Prisma.TransactionIsolationLevel.Serializable }
    )
  } catch (error) {
    if (isSerializationConflict(error)) {
      throw new Error(SCHEDULE_CONFLICT_MESSAGE)
    }
    throw error
  }

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
