import { format } from "date-fns"
import { ptBR } from "date-fns/locale"

import { db } from "@/lib/db"
import type {
  NotificationChannel,
  NotificationType,
} from "@/lib/generated/prisma/enums"
import type { NotificationFilters } from "./schemas"
import { formatCurrency } from "@/lib/format"

const PAGE_SIZE = 20

function pickChannelAndRecipient(customer: {
  email: string | null
  phone: string | null
}): { channel: NotificationChannel; recipient: string } | null {
  if (customer.email) return { channel: "EMAIL", recipient: customer.email }
  if (customer.phone) return { channel: "WHATSAPP", recipient: customer.phone }
  return null
}

export interface CreateNotificationInput {
  organizationId: string
  appointmentId?: string
  customerId?: string
  channel: NotificationChannel
  type: NotificationType
  recipient: string
  subject?: string
  message: string
}

export async function createNotification(input: CreateNotificationInput) {
  return db.notification.create({
    data: {
      organizationId: input.organizationId,
      appointmentId: input.appointmentId ?? null,
      customerId: input.customerId ?? null,
      channel: input.channel,
      type: input.type,
      status: "PENDING",
      recipient: input.recipient,
      subject: input.subject ?? null,
      message: input.message,
    },
  })
}

/**
 * Event builders — called from other modules' Server Actions after a
 * primary mutation succeeds. Each is best-effort: callers wrap these in
 * try/catch so a notification failure never blocks the underlying
 * appointment/finance operation. Each does its own read (rather than
 * requiring callers to pass enriched objects) so this module owns 100%
 * of its own database access, per the module's architecture.
 */

export async function notifyAppointmentCreated(
  organizationId: string,
  appointmentId: string
) {
  const appointment = await db.appointment.findFirst({
    where: { id: appointmentId, organizationId },
    include: { customer: true, service: true },
  })
  if (!appointment) return null

  const target = pickChannelAndRecipient(appointment.customer)
  if (!target) return null

  const when = format(appointment.startsAt, "dd/MM/yyyy 'às' HH:mm", {
    locale: ptBR,
  })

  return createNotification({
    organizationId,
    appointmentId: appointment.id,
    customerId: appointment.customerId,
    channel: target.channel,
    type: "APPOINTMENT_CREATED",
    recipient: target.recipient,
    subject: "Agendamento confirmado",
    message: `Olá ${appointment.customer.name}, seu agendamento de ${appointment.service.name} foi criado para ${when}.`,
  })
}

export async function notifyAppointmentCancelled(
  organizationId: string,
  appointmentId: string
) {
  const appointment = await db.appointment.findFirst({
    where: { id: appointmentId, organizationId },
    include: { customer: true, service: true },
  })
  if (!appointment) return null

  const target = pickChannelAndRecipient(appointment.customer)
  if (!target) return null

  const when = format(appointment.startsAt, "dd/MM/yyyy 'às' HH:mm", {
    locale: ptBR,
  })

  return createNotification({
    organizationId,
    appointmentId: appointment.id,
    customerId: appointment.customerId,
    channel: target.channel,
    type: "APPOINTMENT_CANCELLED",
    recipient: target.recipient,
    subject: "Agendamento cancelado",
    message: `Olá ${appointment.customer.name}, seu agendamento de ${appointment.service.name} em ${when} foi cancelado.`,
  })
}

export async function notifyPaymentReceived(
  organizationId: string,
  transactionId: string
) {
  const transaction = await db.transaction.findFirst({
    where: { id: transactionId, organizationId, type: "INCOME" },
    include: { customer: true },
  })
  if (!transaction || !transaction.customer) return null

  const target = pickChannelAndRecipient(transaction.customer)
  if (!target) return null

  return createNotification({
    organizationId,
    customerId: transaction.customerId ?? undefined,
    channel: target.channel,
    type: "PAYMENT_RECEIVED",
    recipient: target.recipient,
    subject: "Pagamento recebido",
    message: `Olá ${transaction.customer.name}, confirmamos o recebimento do pagamento de ${formatCurrency(Number(transaction.amount))} (${transaction.category}).`,
  })
}

/** Reads */

export async function listNotifications(
  organizationId: string,
  filters: NotificationFilters
) {
  const page = filters.page ?? 1

  const where = {
    organizationId,
    ...(filters.type ? { type: filters.type } : {}),
    ...(filters.channel ? { channel: filters.channel } : {}),
    ...(filters.status ? { status: filters.status } : {}),
    ...(filters.from || filters.to
      ? {
          createdAt: {
            ...(filters.from ? { gte: new Date(`${filters.from}T00:00:00`) } : {}),
            ...(filters.to ? { lte: new Date(`${filters.to}T23:59:59.999`) } : {}),
          },
        }
      : {}),
    ...(filters.q
      ? {
          OR: [
            { recipient: { contains: filters.q, mode: "insensitive" as const } },
            {
              customer: {
                name: { contains: filters.q, mode: "insensitive" as const },
              },
            },
          ],
        }
      : {}),
  }

  const [total, items] = await Promise.all([
    db.notification.count({ where }),
    db.notification.findMany({
      where,
      include: { customer: { select: { id: true, name: true } } },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
    }),
  ])

  return {
    items,
    total,
    page,
    pageSize: PAGE_SIZE,
    totalPages: Math.max(1, Math.ceil(total / PAGE_SIZE)),
  }
}

export function getNotification(id: string, organizationId: string) {
  return db.notification.findFirst({
    where: { id, organizationId },
    include: {
      customer: { select: { id: true, name: true, email: true, phone: true } },
      appointment: {
        select: {
          id: true,
          startsAt: true,
          service: { select: { name: true } },
        },
      },
    },
  })
}

export async function resendNotification(id: string, organizationId: string) {
  const { count } = await db.notification.updateMany({
    where: { id, organizationId },
    data: { status: "PENDING", error: null, sentAt: null },
  })

  if (count === 0) {
    throw new Error("Notificação não encontrada.")
  }
}
