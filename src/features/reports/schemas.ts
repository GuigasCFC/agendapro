export type ReportPeriod = "today" | "7d" | "30d" | "month" | "year" | "custom"

export interface DateRange {
  from: Date
  to: Date
}

export interface ReportFilters {
  employeeId?: string
  serviceId?: string
}

export const PERIOD_OPTIONS: { value: ReportPeriod; label: string }[] = [
  { value: "today", label: "Hoje" },
  { value: "7d", label: "Últimos 7 dias" },
  { value: "30d", label: "Últimos 30 dias" },
  { value: "month", label: "Este mês" },
  { value: "year", label: "Este ano" },
  { value: "custom", label: "Personalizado" },
]

export function isReportPeriod(value: string | undefined): value is ReportPeriod {
  return PERIOD_OPTIONS.some((option) => option.value === value)
}

export function resolveFilters(params: {
  employeeId?: string
  serviceId?: string
}): ReportFilters {
  return {
    employeeId: params.employeeId || undefined,
    serviceId: params.serviceId || undefined,
  }
}

function startOfDay(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate())
}

function endOfDay(date: Date) {
  return new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate(),
    23,
    59,
    59,
    999
  )
}

export function resolvePeriod(
  period: ReportPeriod,
  customFrom?: string,
  customTo?: string
): DateRange {
  const now = new Date()
  const to = endOfDay(now)

  switch (period) {
    case "today":
      return { from: startOfDay(now), to }
    case "7d":
      return {
        from: startOfDay(
          new Date(now.getFullYear(), now.getMonth(), now.getDate() - 6)
        ),
        to,
      }
    case "30d":
      return {
        from: startOfDay(
          new Date(now.getFullYear(), now.getMonth(), now.getDate() - 29)
        ),
        to,
      }
    case "month":
      return { from: new Date(now.getFullYear(), now.getMonth(), 1), to }
    case "year":
      return { from: new Date(now.getFullYear(), 0, 1), to }
    case "custom": {
      const from = customFrom
        ? startOfDay(new Date(`${customFrom}T00:00:00`))
        : new Date(now.getFullYear(), now.getMonth(), 1)
      const customToDate = customTo
        ? endOfDay(new Date(`${customTo}T00:00:00`))
        : to
      return { from, to: customToDate }
    }
    default:
      return { from: new Date(now.getFullYear(), now.getMonth(), 1), to }
  }
}
