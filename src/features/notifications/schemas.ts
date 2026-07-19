import { z } from "zod"

export const NOTIFICATION_TYPE_OPTIONS = [
  { value: "APPOINTMENT_CREATED", label: "Agendamento criado" },
  { value: "APPOINTMENT_CONFIRMED", label: "Agendamento confirmado" },
  { value: "APPOINTMENT_REMINDER", label: "Lembrete de agendamento" },
  { value: "APPOINTMENT_CANCELLED", label: "Agendamento cancelado" },
  { value: "PAYMENT_RECEIVED", label: "Pagamento recebido" },
] as const

export const NOTIFICATION_CHANNEL_OPTIONS = [
  { value: "EMAIL", label: "E-mail" },
  { value: "WHATSAPP", label: "WhatsApp" },
] as const

export const NOTIFICATION_STATUS_OPTIONS = [
  { value: "PENDING", label: "Pendente" },
  { value: "SENT", label: "Enviada" },
  { value: "FAILED", label: "Falhou" },
] as const

export const NOTIFICATION_TYPE_LABELS: Record<string, string> =
  Object.fromEntries(NOTIFICATION_TYPE_OPTIONS.map((o) => [o.value, o.label]))

export const NOTIFICATION_CHANNEL_LABELS: Record<string, string> =
  Object.fromEntries(NOTIFICATION_CHANNEL_OPTIONS.map((o) => [o.value, o.label]))

export const NOTIFICATION_STATUS_LABELS: Record<string, string> =
  Object.fromEntries(NOTIFICATION_STATUS_OPTIONS.map((o) => [o.value, o.label]))

const notificationTypeEnum = z.enum([
  "APPOINTMENT_CREATED",
  "APPOINTMENT_CONFIRMED",
  "APPOINTMENT_REMINDER",
  "APPOINTMENT_CANCELLED",
  "PAYMENT_RECEIVED",
])
const notificationChannelEnum = z.enum(["EMAIL", "WHATSAPP"])
const notificationStatusEnum = z.enum(["PENDING", "SENT", "FAILED"])

export const notificationFiltersSchema = z.object({
  // .catch(undefined): um valor inválido na URL (link velho, digitado à
  // mão) vira "sem filtro" em vez de derrubar a página com erro de banco.
  type: notificationTypeEnum.optional().catch(undefined),
  channel: notificationChannelEnum.optional().catch(undefined),
  status: notificationStatusEnum.optional().catch(undefined),
  from: z.string().optional(),
  to: z.string().optional(),
  q: z.string().optional(),
  page: z.coerce.number().int().min(1).optional(),
})

export type NotificationFilters = z.infer<typeof notificationFiltersSchema>
