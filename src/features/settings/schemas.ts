import { z } from "zod"

export const changePasswordSchema = z
  .object({
    password: z.string().min(8, "A senha deve ter pelo menos 8 caracteres"),
    confirmPassword: z.string().min(1, "Confirme a nova senha"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "As senhas não coincidem",
    path: ["confirmPassword"],
  })

export type ChangePasswordInput = z.infer<typeof changePasswordSchema>

function optionalText(max: number) {
  return z
    .string()
    .trim()
    .max(max, `Máximo de ${max} caracteres`)
    .transform((value) => (value.length > 0 ? value : null))
}

export const organizationDetailsSchema = z.object({
  tradeName: optionalText(120),
  contactEmail: optionalText(160).refine(
    (value) => value === null || z.email().safeParse(value).success,
    { message: "Informe um e-mail válido" }
  ),
  phone: optionalText(30),
  whatsapp: optionalText(30),
  website: optionalText(200),
  addressLine: optionalText(200),
  city: optionalText(100),
  state: optionalText(100),
  zipCode: optionalText(20),
})

export type OrganizationDetailsInput = z.infer<typeof organizationDetailsSchema>

export const SLOT_MINUTES_OPTIONS = [15, 30, 45, 60] as const

export const agendaSettingsSchema = z.object({
  appointmentSlotMinutes: z.coerce
    .number()
    .int()
    .refine((value) => (SLOT_MINUTES_OPTIONS as readonly number[]).includes(value), {
      message: "Selecione um intervalo válido",
    }),
})

export type AgendaSettingsInput = z.infer<typeof agendaSettingsSchema>

export const LOCALE_OPTIONS = [
  { value: "pt-BR", label: "Português (Brasil)" },
  { value: "en-US", label: "English (US)" },
  { value: "es-ES", label: "Español" },
]

export const CURRENCY_OPTIONS = [
  { value: "BRL", label: "Real (R$)" },
  { value: "USD", label: "Dólar (US$)" },
  { value: "EUR", label: "Euro (€)" },
]

export const TIMEZONE_OPTIONS = [
  { value: "America/Sao_Paulo", label: "Brasília (GMT-3)" },
  { value: "America/Manaus", label: "Manaus (GMT-4)" },
  { value: "America/Noronha", label: "Fernando de Noronha (GMT-2)" },
]

export const DATE_FORMAT_OPTIONS = [
  { value: "dd/MM/yyyy", label: "31/12/2026" },
  { value: "MM/dd/yyyy", label: "12/31/2026" },
  { value: "yyyy-MM-dd", label: "2026-12-31" },
]

export const TIME_FORMAT_OPTIONS = [
  { value: "24h", label: "24 horas (14:30)" },
  { value: "12h", label: "12 horas (2:30 PM)" },
]

export const preferencesSchema = z.object({
  locale: z.string().min(1, "Selecione um idioma"),
  currency: z.string().min(1, "Selecione uma moeda"),
  timezone: z.string().min(1, "Selecione um fuso horário"),
  dateFormat: z.string().min(1, "Selecione um formato de data"),
  timeFormat: z.string().min(1, "Selecione um formato de hora"),
})

export type PreferencesInput = z.infer<typeof preferencesSchema>

export const WEEKDAYS = [
  "MONDAY",
  "TUESDAY",
  "WEDNESDAY",
  "THURSDAY",
  "FRIDAY",
  "SATURDAY",
  "SUNDAY",
] as const

export type WeekdayValue = (typeof WEEKDAYS)[number]

export const WEEKDAY_LABELS: Record<WeekdayValue, string> = {
  MONDAY: "Segunda",
  TUESDAY: "Terça",
  WEDNESDAY: "Quarta",
  THURSDAY: "Quinta",
  FRIDAY: "Sexta",
  SATURDAY: "Sábado",
  SUNDAY: "Domingo",
}

const timePattern = /^([01]\d|2[0-3]):([0-5]\d)$/

export const businessHoursDaySchema = z
  .object({
    weekday: z.enum(WEEKDAYS),
    isOpen: z.boolean(),
    opensAt: z.string().optional(),
    closesAt: z.string().optional(),
  })
  .refine((day) => !day.isOpen || (!!day.opensAt && timePattern.test(day.opensAt)), {
    message: "Informe um horário de abertura válido",
    path: ["opensAt"],
  })
  .refine((day) => !day.isOpen || (!!day.closesAt && timePattern.test(day.closesAt)), {
    message: "Informe um horário de fechamento válido",
    path: ["closesAt"],
  })

export type BusinessHoursDayInput = z.infer<typeof businessHoursDaySchema>
