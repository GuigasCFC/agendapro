import { format } from "date-fns"
import { PDFDocument, StandardFonts, rgb } from "pdf-lib"

import { db } from "@/lib/db"
import { Prisma } from "@/lib/generated/prisma/client"
import type { DateRange, ReportFilters } from "./schemas"

function appointmentFilterWhere(filters: ReportFilters) {
  return {
    ...(filters.employeeId ? { employeeId: filters.employeeId } : {}),
    ...(filters.serviceId ? { serviceId: filters.serviceId } : {}),
  }
}

function transactionAppointmentFilter(filters: ReportFilters) {
  const appointmentFilter = appointmentFilterWhere(filters)
  if (Object.keys(appointmentFilter).length === 0) return {}
  return { appointment: { is: appointmentFilter } }
}

function dayKey(date: Date) {
  return `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`
}

function buildDayBuckets(range: DateRange) {
  const buckets: { key: string; date: Date }[] = []
  const cursor = new Date(range.from.getFullYear(), range.from.getMonth(), range.from.getDate())
  const end = new Date(range.to.getFullYear(), range.to.getMonth(), range.to.getDate())

  while (cursor <= end) {
    buckets.push({ key: dayKey(cursor), date: new Date(cursor) })
    cursor.setDate(cursor.getDate() + 1)
  }

  return buckets
}

export interface RankingRow {
  id: string
  name: string
  count: number
}

export interface ReportKPIs {
  totalRevenue: number
  periodRevenue: number
  appointmentsCount: number
  averageTicket: number
  customersServed: number
  servicesCompleted: number
  recurringCustomers: RankingRow[]
}

export async function getDashboardKPIs(
  organizationId: string,
  range: DateRange,
  filters: ReportFilters = {}
): Promise<ReportKPIs> {
  const appointmentWhere = { organizationId, ...appointmentFilterWhere(filters) }
  const transactionWhere = { organizationId, ...transactionAppointmentFilter(filters) }

  const [totalRevenueAgg, periodRevenueAgg, appointmentsCount, servicesCompleted, completedByCustomer] =
    await Promise.all([
      db.transaction.aggregate({
        where: { ...transactionWhere, type: "INCOME" },
        _sum: { amount: true },
      }),
      db.transaction.aggregate({
        where: {
          ...transactionWhere,
          type: "INCOME",
          occurredAt: { gte: range.from, lte: range.to },
        },
        _sum: { amount: true },
        _avg: { amount: true },
      }),
      db.appointment.count({
        where: { ...appointmentWhere, startsAt: { gte: range.from, lte: range.to } },
      }),
      db.appointment.count({
        where: {
          ...appointmentWhere,
          status: "COMPLETED",
          startsAt: { gte: range.from, lte: range.to },
        },
      }),
      db.appointment.groupBy({
        by: ["customerId"],
        where: {
          ...appointmentWhere,
          status: "COMPLETED",
          startsAt: { gte: range.from, lte: range.to },
        },
        _count: { _all: true },
      }),
    ])

  const recurring = completedByCustomer
    .filter((row) => row._count._all >= 2)
    .sort((a, b) => b._count._all - a._count._all)
    .slice(0, 10)

  let recurringCustomers: RankingRow[] = []
  if (recurring.length > 0) {
    const customers = await db.customer.findMany({
      where: { id: { in: recurring.map((row) => row.customerId) }, organizationId },
      select: { id: true, name: true },
    })
    const nameById = new Map(customers.map((customer) => [customer.id, customer.name]))
    recurringCustomers = recurring.map((row) => ({
      id: row.customerId,
      name: nameById.get(row.customerId) ?? "—",
      count: row._count._all,
    }))
  }

  return {
    totalRevenue: Number(totalRevenueAgg._sum.amount ?? 0),
    periodRevenue: Number(periodRevenueAgg._sum.amount ?? 0),
    appointmentsCount,
    averageTicket: Number(periodRevenueAgg._avg.amount ?? 0),
    customersServed: completedByCustomer.length,
    servicesCompleted,
    recurringCustomers,
  }
}

export interface RevenuePoint {
  date: Date
  total: number
}

export async function getRevenueReport(
  organizationId: string,
  range: DateRange,
  filters: ReportFilters = {}
): Promise<RevenuePoint[]> {
  const transactions = await db.transaction.findMany({
    where: {
      organizationId,
      type: "INCOME",
      occurredAt: { gte: range.from, lte: range.to },
      ...transactionAppointmentFilter(filters),
    },
    select: { amount: true, occurredAt: true },
  })

  const buckets = buildDayBuckets(range)
  const totals = new Map(buckets.map((bucket) => [bucket.key, new Prisma.Decimal(0)]))

  for (const transaction of transactions) {
    const key = dayKey(transaction.occurredAt)
    const current = totals.get(key)
    if (!current) continue
    totals.set(key, current.plus(transaction.amount))
  }

  return buckets.map((bucket) => ({
    date: bucket.date,
    total: (totals.get(bucket.key) ?? new Prisma.Decimal(0)).toNumber(),
  }))
}

export interface AppointmentCountPoint {
  date: Date
  count: number
}

export async function getAppointmentsReport(
  organizationId: string,
  range: DateRange,
  filters: ReportFilters = {}
): Promise<AppointmentCountPoint[]> {
  const appointments = await db.appointment.findMany({
    where: {
      organizationId,
      startsAt: { gte: range.from, lte: range.to },
      ...appointmentFilterWhere(filters),
    },
    select: { startsAt: true },
  })

  const buckets = buildDayBuckets(range)
  const counts = new Map(buckets.map((bucket) => [bucket.key, 0]))

  for (const appointment of appointments) {
    const key = dayKey(appointment.startsAt)
    if (!counts.has(key)) continue
    counts.set(key, (counts.get(key) ?? 0) + 1)
  }

  return buckets.map((bucket) => ({ date: bucket.date, count: counts.get(bucket.key) ?? 0 }))
}

export interface ReportRankingRow {
  id: string
  name: string
  count: number
  revenue: number
}

export async function getServicesReport(
  organizationId: string,
  range: DateRange,
  filters: ReportFilters = {},
  limit = 10
): Promise<ReportRankingRow[]> {
  const [grouped, transactions] = await Promise.all([
    db.appointment.groupBy({
      by: ["serviceId"],
      where: {
        organizationId,
        status: "COMPLETED",
        startsAt: { gte: range.from, lte: range.to },
        ...appointmentFilterWhere(filters),
      },
      _count: { _all: true },
      orderBy: { _count: { serviceId: "desc" } },
      take: limit,
    }),
    db.transaction.findMany({
      where: {
        organizationId,
        type: "INCOME",
        occurredAt: { gte: range.from, lte: range.to },
        ...transactionAppointmentFilter(filters),
      },
      select: { amount: true, appointment: { select: { serviceId: true } } },
    }),
  ])

  if (grouped.length === 0) return []

  const revenueByService = new Map<string, Prisma.Decimal>()
  for (const transaction of transactions) {
    const serviceId = transaction.appointment?.serviceId
    if (!serviceId) continue
    const current = revenueByService.get(serviceId) ?? new Prisma.Decimal(0)
    revenueByService.set(serviceId, current.plus(transaction.amount))
  }

  const services = await db.service.findMany({
    where: { id: { in: grouped.map((row) => row.serviceId) }, organizationId },
    select: { id: true, name: true },
  })
  const nameById = new Map(services.map((service) => [service.id, service.name]))

  return grouped.map((row) => ({
    id: row.serviceId,
    name: nameById.get(row.serviceId) ?? "—",
    count: row._count._all,
    revenue: (revenueByService.get(row.serviceId) ?? new Prisma.Decimal(0)).toNumber(),
  }))
}

export async function getEmployeesReport(
  organizationId: string,
  range: DateRange,
  filters: ReportFilters = {},
  limit = 10
): Promise<ReportRankingRow[]> {
  const [grouped, transactions] = await Promise.all([
    db.appointment.groupBy({
      by: ["employeeId"],
      where: {
        organizationId,
        status: "COMPLETED",
        startsAt: { gte: range.from, lte: range.to },
        ...appointmentFilterWhere(filters),
      },
      _count: { _all: true },
      orderBy: { _count: { employeeId: "desc" } },
      take: limit,
    }),
    db.transaction.findMany({
      where: {
        organizationId,
        type: "INCOME",
        occurredAt: { gte: range.from, lte: range.to },
        ...transactionAppointmentFilter(filters),
      },
      select: { amount: true, appointment: { select: { employeeId: true } } },
    }),
  ])

  if (grouped.length === 0) return []

  const revenueByEmployee = new Map<string, Prisma.Decimal>()
  for (const transaction of transactions) {
    const employeeId = transaction.appointment?.employeeId
    if (!employeeId) continue
    const current = revenueByEmployee.get(employeeId) ?? new Prisma.Decimal(0)
    revenueByEmployee.set(employeeId, current.plus(transaction.amount))
  }

  const employees = await db.employee.findMany({
    where: { id: { in: grouped.map((row) => row.employeeId) }, organizationId },
    select: { id: true, name: true },
  })
  const nameById = new Map(employees.map((employee) => [employee.id, employee.name]))

  return grouped.map((row) => ({
    id: row.employeeId,
    name: nameById.get(row.employeeId) ?? "—",
    count: row._count._all,
    revenue: (revenueByEmployee.get(row.employeeId) ?? new Prisma.Decimal(0)).toNumber(),
  }))
}

interface ExportData {
  kpis: ReportKPIs
  revenue: RevenuePoint[]
  appointments: AppointmentCountPoint[]
  services: ReportRankingRow[]
  employees: ReportRankingRow[]
}

async function getExportData(
  organizationId: string,
  range: DateRange,
  filters: ReportFilters
): Promise<ExportData> {
  const [kpis, revenue, appointments, services, employees] = await Promise.all([
    getDashboardKPIs(organizationId, range, filters),
    getRevenueReport(organizationId, range, filters),
    getAppointmentsReport(organizationId, range, filters),
    getServicesReport(organizationId, range, filters),
    getEmployeesReport(organizationId, range, filters),
  ])

  return { kpis, revenue, appointments, services, employees }
}

function csvEscape(value: string | number) {
  return `"${String(value).replace(/"/g, '""')}"`
}

function buildCsv(data: ExportData): string {
  const { kpis, revenue, appointments, services, employees } = data
  const lines: string[] = []

  lines.push("Resumo")
  lines.push(`Receita total,${kpis.totalRevenue}`)
  lines.push(`Receita do período,${kpis.periodRevenue}`)
  lines.push(`Número de agendamentos,${kpis.appointmentsCount}`)
  lines.push(`Ticket médio,${kpis.averageTicket}`)
  lines.push(`Clientes atendidos,${kpis.customersServed}`)
  lines.push(`Serviços realizados,${kpis.servicesCompleted}`)
  lines.push("")

  lines.push("Receita por dia")
  lines.push("Data,Receita")
  for (const point of revenue) {
    lines.push(`${format(point.date, "dd/MM/yyyy")},${point.total}`)
  }
  lines.push("")

  lines.push("Agendamentos por dia")
  lines.push("Data,Quantidade")
  for (const point of appointments) {
    lines.push(`${format(point.date, "dd/MM/yyyy")},${point.count}`)
  }
  lines.push("")

  lines.push("Serviços mais vendidos")
  lines.push("Serviço,Atendimentos,Receita")
  for (const row of services) {
    lines.push(`${csvEscape(row.name)},${row.count},${row.revenue}`)
  }
  lines.push("")

  lines.push("Funcionários")
  lines.push("Funcionário,Atendimentos,Receita")
  for (const row of employees) {
    lines.push(`${csvEscape(row.name)},${row.count},${row.revenue}`)
  }
  lines.push("")

  lines.push("Clientes recorrentes")
  lines.push("Cliente,Atendimentos")
  for (const row of kpis.recurringCustomers) {
    lines.push(`${csvEscape(row.name)},${row.count}`)
  }

  return lines.join("\n")
}

function formatCurrencyForPdf(value: number) {
  return value.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  })
}

async function buildPdf(data: ExportData, range: DateRange): Promise<Uint8Array> {
  const { kpis, revenue, appointments, services, employees } = data

  const pageWidth = 595.28
  const pageHeight = 841.89
  const margin = 48
  const lineHeight = 14

  const doc = await PDFDocument.create()
  const font = await doc.embedFont(StandardFonts.Helvetica)
  const boldFont = await doc.embedFont(StandardFonts.HelveticaBold)

  let page = doc.addPage([pageWidth, pageHeight])
  let y = pageHeight - margin

  function ensureSpace(rows = 1) {
    if (y - rows * lineHeight < margin) {
      page = doc.addPage([pageWidth, pageHeight])
      y = pageHeight - margin
    }
  }

  function drawTitle(text: string) {
    ensureSpace(2)
    page.drawText(text, { x: margin, y, size: 16, font: boldFont, color: rgb(0.1, 0.1, 0.1) })
    y -= lineHeight * 1.8
  }

  function drawSectionHeader(text: string) {
    ensureSpace(2)
    page.drawText(text, { x: margin, y, size: 12, font: boldFont, color: rgb(0.1, 0.1, 0.1) })
    y -= lineHeight * 1.4
  }

  function drawRow(text: string) {
    ensureSpace()
    page.drawText(text, { x: margin, y, size: 10, font, color: rgb(0.25, 0.25, 0.25) })
    y -= lineHeight
  }

  function spacer() {
    y -= lineHeight * 0.5
  }

  drawTitle("Relatório de desempenho")
  drawRow(`Período: ${format(range.from, "dd/MM/yyyy")} a ${format(range.to, "dd/MM/yyyy")}`)
  spacer()

  drawSectionHeader("Resumo")
  drawRow(`Receita total: ${formatCurrencyForPdf(kpis.totalRevenue)}`)
  drawRow(`Receita do período: ${formatCurrencyForPdf(kpis.periodRevenue)}`)
  drawRow(`Número de agendamentos: ${kpis.appointmentsCount}`)
  drawRow(`Ticket médio: ${formatCurrencyForPdf(kpis.averageTicket)}`)
  drawRow(`Clientes atendidos: ${kpis.customersServed}`)
  drawRow(`Serviços realizados: ${kpis.servicesCompleted}`)
  spacer()

  drawSectionHeader("Receita por dia")
  for (const point of revenue) {
    drawRow(`${format(point.date, "dd/MM/yyyy")} - ${formatCurrencyForPdf(point.total)}`)
  }
  spacer()

  drawSectionHeader("Agendamentos por dia")
  for (const point of appointments) {
    drawRow(`${format(point.date, "dd/MM/yyyy")} - ${point.count}`)
  }
  spacer()

  drawSectionHeader("Serviços mais vendidos")
  if (services.length === 0) drawRow("Nenhum serviço concluído no período.")
  for (const row of services) {
    drawRow(`${row.name} - ${row.count} atendimentos - ${formatCurrencyForPdf(row.revenue)}`)
  }
  spacer()

  drawSectionHeader("Funcionários")
  if (employees.length === 0) drawRow("Nenhum atendimento concluído no período.")
  for (const row of employees) {
    drawRow(`${row.name} - ${row.count} atendimentos - ${formatCurrencyForPdf(row.revenue)}`)
  }
  spacer()

  drawSectionHeader("Clientes recorrentes")
  if (kpis.recurringCustomers.length === 0) drawRow("Nenhum cliente recorrente no período.")
  for (const row of kpis.recurringCustomers) {
    drawRow(`${row.name} - ${row.count} atendimentos`)
  }

  return doc.save()
}

export async function exportCsv(
  organizationId: string,
  range: DateRange,
  filters: ReportFilters = {}
): Promise<string> {
  const data = await getExportData(organizationId, range, filters)
  return buildCsv(data)
}

export async function exportPdf(
  organizationId: string,
  range: DateRange,
  filters: ReportFilters = {}
): Promise<Uint8Array> {
  const data = await getExportData(organizationId, range, filters)
  return buildPdf(data, range)
}
