"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { getActiveMembership } from "@/lib/auth/dal"
import { requireRole } from "@/lib/auth/authorize"
import { Prisma } from "@/lib/generated/prisma/client"
import { createAppointmentSchema, updateAppointmentSchema } from "./schemas"
import * as appointmentsService from "./services"
import * as notificationsService from "@/features/notifications/services"

export type AppointmentFormState =
  | {
      errors?: Record<string, string[] | undefined>
      message?: string
    }
  | undefined

export async function createAppointment(
  _state: AppointmentFormState,
  formData: FormData
): Promise<AppointmentFormState> {
  const membership = await getActiveMembership()
  if (!membership) redirect("/login")

  const validated = createAppointmentSchema.safeParse({
    customerId: formData.get("customerId"),
    serviceId: formData.get("serviceId"),
    employeeId: formData.get("employeeId"),
    date: formData.get("date"),
    time: formData.get("time"),
    status: formData.get("status"),
    notes: formData.get("notes"),
  })

  if (!validated.success) {
    return { errors: validated.error.flatten().fieldErrors }
  }

  let appointment
  try {
    appointment = await appointmentsService.createAppointment(
      validated.data,
      membership.organizationId
    )
  } catch (error) {
    return {
      message:
        error instanceof Error
          ? error.message
          : "Não foi possível criar o agendamento.",
    }
  }

  try {
    await notificationsService.notifyAppointmentCreated(
      membership.organizationId,
      appointment.id
    )
  } catch {
    // A falha ao registrar a notificação nunca deve bloquear o agendamento.
  }

  revalidatePath("/appointments")
  redirect("/appointments")
}

export async function updateAppointment(
  _state: AppointmentFormState,
  formData: FormData
): Promise<AppointmentFormState> {
  const membership = await getActiveMembership()
  if (!membership) redirect("/login")

  const validated = updateAppointmentSchema.safeParse({
    id: formData.get("id"),
    customerId: formData.get("customerId"),
    serviceId: formData.get("serviceId"),
    employeeId: formData.get("employeeId"),
    date: formData.get("date"),
    time: formData.get("time"),
    status: formData.get("status"),
    notes: formData.get("notes"),
  })

  if (!validated.success) {
    return { errors: validated.error.flatten().fieldErrors }
  }

  const previous = await appointmentsService.getAppointment(
    validated.data.id,
    membership.organizationId
  )

  try {
    await appointmentsService.updateAppointment(
      validated.data.id,
      validated.data,
      membership.organizationId
    )
  } catch (error) {
    return {
      message:
        error instanceof Error
          ? error.message
          : "Não foi possível atualizar o agendamento.",
    }
  }

  if (previous && previous.status !== "CANCELED" && validated.data.status === "CANCELED") {
    try {
      await notificationsService.notifyAppointmentCancelled(
        membership.organizationId,
        validated.data.id
      )
    } catch {
      // A falha ao registrar a notificação nunca deve bloquear o agendamento.
    }
  }

  revalidatePath("/appointments")
  redirect("/appointments")
}

export async function deleteAppointment(id: string) {
  const membership = await requireRole("ADMIN")

  try {
    await appointmentsService.deleteAppointment(id, membership.organizationId)
  } catch (error) {
    // Agendamento com transação/notificação vinculada: a FK impede o
    // delete. Evita quebrar a tela com um erro de banco não tratado.
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2003") {
      revalidatePath("/appointments")
      return
    }
    throw error
  }

  revalidatePath("/appointments")
}
