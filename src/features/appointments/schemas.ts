import { z } from "zod"

export const appointmentStatusEnum = z.enum([
  "SCHEDULED",
  "CONFIRMED",
  "COMPLETED",
  "CANCELED",
  "NO_SHOW",
])

export const createAppointmentSchema = z.object({
  customerId: z.string().min(1, "Selecione um cliente"),
  serviceId: z.string().min(1, "Selecione um serviço"),
  employeeId: z.string().min(1, "Selecione um funcionário"),
  date: z.string().min(1, "Informe a data"),
  time: z.string().min(1, "Informe o horário"),
  status: appointmentStatusEnum,
  notes: z.string().optional().or(z.literal("")),
})

export const updateAppointmentSchema = createAppointmentSchema.extend({
  id: z.string().min(1),
})

export type CreateAppointmentInput = z.infer<typeof createAppointmentSchema>
export type UpdateAppointmentInput = z.infer<typeof updateAppointmentSchema>
