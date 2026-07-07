"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { getActiveMembership } from "@/lib/auth/dal"
import { createAppointmentSchema, updateAppointmentSchema } from "./schemas"
import * as appointmentsService from "./services"

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

  try {
    await appointmentsService.createAppointment(
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

  revalidatePath("/appointments")
  redirect("/appointments")
}

export async function deleteAppointment(id: string) {
  const membership = await getActiveMembership()
  if (!membership) redirect("/login")

  await appointmentsService.deleteAppointment(id, membership.organizationId)

  revalidatePath("/appointments")
}
