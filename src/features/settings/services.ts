import { db } from "@/lib/db"
import type {
  AgendaSettingsInput,
  BusinessHoursDayInput,
  OrganizationDetailsInput,
  PreferencesInput,
  WeekdayValue,
} from "./schemas"
import { WEEKDAYS } from "./schemas"

export async function getOrganizationSettings(organizationId: string) {
  return db.organization.findUniqueOrThrow({
    where: { id: organizationId },
    select: {
      id: true,
      name: true,
      tradeName: true,
      contactEmail: true,
      phone: true,
      whatsapp: true,
      website: true,
      addressLine: true,
      city: true,
      state: true,
      zipCode: true,
      appointmentSlotMinutes: true,
      locale: true,
      currency: true,
      timezone: true,
      dateFormat: true,
      timeFormat: true,
    },
  })
}

export async function updateOrganizationDetails(
  organizationId: string,
  data: OrganizationDetailsInput
) {
  await db.organization.update({
    where: { id: organizationId },
    data,
  })
}

export async function updateAgendaSettings(
  organizationId: string,
  data: AgendaSettingsInput
) {
  await db.organization.update({
    where: { id: organizationId },
    data,
  })
}

export async function updatePreferences(
  organizationId: string,
  data: PreferencesInput
) {
  await db.organization.update({
    where: { id: organizationId },
    data,
  })
}

export interface BusinessHoursDay {
  weekday: WeekdayValue
  isOpen: boolean
  opensAt: string | null
  closesAt: string | null
}

export async function getBusinessHours(
  organizationId: string
): Promise<BusinessHoursDay[]> {
  const rows = await db.businessHours.findMany({
    where: { organizationId },
  })

  const byWeekday = new Map(rows.map((row) => [row.weekday, row]))

  return WEEKDAYS.map((weekday) => {
    const row = byWeekday.get(weekday)
    return {
      weekday,
      isOpen: row?.isOpen ?? false,
      opensAt: row?.opensAt ?? null,
      closesAt: row?.closesAt ?? null,
    }
  })
}

export async function upsertBusinessHours(
  organizationId: string,
  days: BusinessHoursDayInput[]
) {
  await db.$transaction(
    days.map((day) =>
      db.businessHours.upsert({
        where: {
          organizationId_weekday: { organizationId, weekday: day.weekday },
        },
        create: {
          organizationId,
          weekday: day.weekday,
          isOpen: day.isOpen,
          opensAt: day.isOpen ? (day.opensAt ?? null) : null,
          closesAt: day.isOpen ? (day.closesAt ?? null) : null,
        },
        update: {
          isOpen: day.isOpen,
          opensAt: day.isOpen ? (day.opensAt ?? null) : null,
          closesAt: day.isOpen ? (day.closesAt ?? null) : null,
        },
      })
    )
  )
}

export interface TeamMember {
  id: string
  name: string
  email: string | null
  role: string | null
  active: boolean
}

export async function getTeamOverview(
  organizationId: string
): Promise<TeamMember[]> {
  const employees = await db.employee.findMany({
    where: { organizationId },
    select: {
      id: true,
      name: true,
      role: true,
      active: true,
      user: { select: { email: true } },
    },
    orderBy: { name: "asc" },
  })

  return employees.map((employee) => ({
    id: employee.id,
    name: employee.name,
    email: employee.user?.email ?? null,
    role: employee.role,
    active: employee.active,
  }))
}
