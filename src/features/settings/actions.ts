"use server"

import { revalidatePath } from "next/cache"
import { createClient } from "@/lib/supabase/server"
import { requireSession } from "@/lib/auth/dal"
import { requireRole } from "@/lib/auth/authorize"
import {
  agendaSettingsSchema,
  businessHoursDaySchema,
  changePasswordSchema,
  organizationDetailsSchema,
  preferencesSchema,
  WEEKDAYS,
  type BusinessHoursDayInput,
} from "./schemas"
import * as settingsService from "./services"

export type SettingsActionState =
  | {
      errors?: Record<string, string[] | undefined>
      message?: string
      success?: boolean
    }
  | undefined

export async function changePassword(
  _state: SettingsActionState,
  formData: FormData
): Promise<SettingsActionState> {
  await requireSession()

  const validated = changePasswordSchema.safeParse({
    password: formData.get("password"),
    confirmPassword: formData.get("confirmPassword"),
  })

  if (!validated.success) {
    return { errors: validated.error.flatten().fieldErrors }
  }

  const supabase = await createClient()
  const { error } = await supabase.auth.updateUser({
    password: validated.data.password,
  })

  if (error) {
    return { message: error.message || "Não foi possível alterar a senha." }
  }

  return { success: true }
}

export async function updateOrganizationDetails(
  _state: SettingsActionState,
  formData: FormData
): Promise<SettingsActionState> {
  const membership = await requireRole("ADMIN")

  const validated = organizationDetailsSchema.safeParse({
    tradeName: formData.get("tradeName") ?? "",
    contactEmail: formData.get("contactEmail") ?? "",
    phone: formData.get("phone") ?? "",
    whatsapp: formData.get("whatsapp") ?? "",
    website: formData.get("website") ?? "",
    addressLine: formData.get("addressLine") ?? "",
    city: formData.get("city") ?? "",
    state: formData.get("state") ?? "",
    zipCode: formData.get("zipCode") ?? "",
  })

  if (!validated.success) {
    return { errors: validated.error.flatten().fieldErrors }
  }

  try {
    await settingsService.updateOrganizationDetails(
      membership.organizationId,
      validated.data
    )
  } catch {
    return { message: "Não foi possível atualizar os dados da empresa." }
  }

  revalidatePath("/settings")
  return { success: true }
}

export async function updateAgendaSettings(
  _state: SettingsActionState,
  formData: FormData
): Promise<SettingsActionState> {
  const membership = await requireRole("ADMIN")

  const validated = agendaSettingsSchema.safeParse({
    appointmentSlotMinutes: formData.get("appointmentSlotMinutes"),
  })

  if (!validated.success) {
    return { errors: validated.error.flatten().fieldErrors }
  }

  try {
    await settingsService.updateAgendaSettings(
      membership.organizationId,
      validated.data
    )
  } catch {
    return { message: "Não foi possível atualizar as configurações de agenda." }
  }

  revalidatePath("/settings")
  return { success: true }
}

export async function updatePreferences(
  _state: SettingsActionState,
  formData: FormData
): Promise<SettingsActionState> {
  const membership = await requireRole("ADMIN")

  const validated = preferencesSchema.safeParse({
    locale: formData.get("locale"),
    currency: formData.get("currency"),
    timezone: formData.get("timezone"),
    dateFormat: formData.get("dateFormat"),
    timeFormat: formData.get("timeFormat"),
  })

  if (!validated.success) {
    return { errors: validated.error.flatten().fieldErrors }
  }

  try {
    await settingsService.updatePreferences(
      membership.organizationId,
      validated.data
    )
  } catch {
    return { message: "Não foi possível atualizar as preferências." }
  }

  revalidatePath("/settings")
  return { success: true }
}

export async function updateBusinessHours(
  _state: SettingsActionState,
  formData: FormData
): Promise<SettingsActionState> {
  const membership = await requireRole("ADMIN")

  const fieldErrors: Record<string, string[] | undefined> = {}
  const days: BusinessHoursDayInput[] = []

  for (const weekday of WEEKDAYS) {
    const isOpen = formData.get(`${weekday}-isOpen`) === "on"
    const opensAtRaw = formData.get(`${weekday}-opensAt`)
    const closesAtRaw = formData.get(`${weekday}-closesAt`)

    const parsed = businessHoursDaySchema.safeParse({
      weekday,
      isOpen,
      opensAt:
        typeof opensAtRaw === "string" && opensAtRaw.length > 0
          ? opensAtRaw
          : undefined,
      closesAt:
        typeof closesAtRaw === "string" && closesAtRaw.length > 0
          ? closesAtRaw
          : undefined,
    })

    if (!parsed.success) {
      fieldErrors[weekday] = parsed.error.issues.map((issue) => issue.message)
      continue
    }

    days.push(parsed.data)
  }

  if (Object.keys(fieldErrors).length > 0) {
    return { errors: fieldErrors }
  }

  try {
    await settingsService.upsertBusinessHours(membership.organizationId, days)
  } catch {
    return { message: "Não foi possível atualizar o horário de funcionamento." }
  }

  revalidatePath("/settings")
  return { success: true }
}
