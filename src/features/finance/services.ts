import { db } from "@/lib/db"
import type { CreateTransactionInput, UpdateTransactionInput } from "./schemas"

export function listTransactions(organizationId: string) {
  return db.transaction.findMany({
    where: { organizationId },
    include: { customer: true, appointment: true },
    orderBy: { occurredAt: "desc" },
  })
}

export function getTransaction(id: string, organizationId: string) {
  return db.transaction.findFirst({
    where: { id, organizationId },
  })
}

async function assertOptionalRelationsBelongToOrg(
  organizationId: string,
  customerId: string | undefined,
  appointmentId: string | undefined
) {
  if (customerId) {
    const customer = await db.customer.findFirst({
      where: { id: customerId, organizationId },
    })
    if (!customer) {
      throw new Error("Cliente não encontrado.")
    }
  }

  if (appointmentId) {
    const appointment = await db.appointment.findFirst({
      where: { id: appointmentId, organizationId },
    })
    if (!appointment) {
      throw new Error("Agendamento não encontrado.")
    }
  }
}

export async function createTransaction(
  data: CreateTransactionInput,
  organizationId: string
) {
  await assertOptionalRelationsBelongToOrg(
    organizationId,
    data.customerId || undefined,
    data.appointmentId || undefined
  )

  return db.transaction.create({
    data: {
      organizationId,
      type: data.type,
      amount: data.amount,
      category: data.category,
      description: data.description || null,
      occurredAt: new Date(data.occurredAt),
      customerId: data.customerId || null,
      appointmentId: data.appointmentId || null,
    },
  })
}

export async function updateTransaction(
  id: string,
  data: UpdateTransactionInput,
  organizationId: string
) {
  await assertOptionalRelationsBelongToOrg(
    organizationId,
    data.customerId || undefined,
    data.appointmentId || undefined
  )

  const { count } = await db.transaction.updateMany({
    where: { id, organizationId },
    data: {
      type: data.type,
      amount: data.amount,
      category: data.category,
      description: data.description || null,
      occurredAt: new Date(data.occurredAt),
      customerId: data.customerId || null,
      appointmentId: data.appointmentId || null,
    },
  })

  if (count === 0) {
    throw new Error("Transação não encontrada.")
  }
}

export async function deleteTransaction(id: string, organizationId: string) {
  const { count } = await db.transaction.deleteMany({
    where: { id, organizationId },
  })

  if (count === 0) {
    throw new Error("Transação não encontrada.")
  }
}
