import { db } from "@/lib/db"
import { Prisma } from "@/lib/generated/prisma/client"

const ACTIVE_STATUSES = ["SCHEDULED", "CONFIRMED", "COMPLETED"] as const

export async function getDashboardStats(organizationId: string) {
  const now = new Date()
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const endOfToday = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate(),
    23,
    59,
    59,
    999
  )
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)

  const [appointmentsToday, customersCount, revenueAgg, activeServicesCount] =
    await Promise.all([
      db.appointment.count({
        where: {
          organizationId,
          startsAt: { gte: startOfToday, lte: endOfToday },
          status: { not: "CANCELED" },
        },
      }),
      db.customer.count({ where: { organizationId } }),
      db.transaction.aggregate({
        where: {
          organizationId,
          type: "INCOME",
          occurredAt: { gte: startOfMonth, lte: endOfToday },
        },
        _sum: { amount: true },
      }),
      db.service.count({ where: { organizationId, active: true } }),
    ])

  return {
    appointmentsToday,
    customersCount,
    revenueThisMonth: Number(revenueAgg._sum.amount ?? 0),
    activeServicesCount,
  }
}

export async function getAppointmentsLast7Days(organizationId: string) {
  const now = new Date()
  const start = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 6)
  const end = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate(),
    23,
    59,
    59,
    999
  )

  const appointments = await db.appointment.findMany({
    where: { organizationId, startsAt: { gte: start, lte: end } },
    select: { startsAt: true },
  })

  const days = Array.from({ length: 7 }, (_, i) => {
    const date = new Date(now.getFullYear(), now.getMonth(), now.getDate() - (6 - i))
    return { key: `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`, date, count: 0 }
  })

  for (const appointment of appointments) {
    const key = `${appointment.startsAt.getFullYear()}-${appointment.startsAt.getMonth()}-${appointment.startsAt.getDate()}`
    const bucket = days.find((day) => day.key === key)
    if (bucket) bucket.count += 1
  }

  return days.map(({ date, count }) => ({ date, count }))
}

export async function getRevenueChartData(organizationId: string) {
  const now = new Date()
  const start = new Date(now.getFullYear(), now.getMonth() - 5, 1)

  const transactions = await db.transaction.findMany({
    where: { organizationId, occurredAt: { gte: start } },
    select: { type: true, amount: true, occurredAt: true },
  })

  const months = Array.from({ length: 6 }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1)
    return {
      key: `${d.getFullYear()}-${d.getMonth()}`,
      month: d,
      income: new Prisma.Decimal(0),
      expense: new Prisma.Decimal(0),
    }
  })

  for (const transaction of transactions) {
    const key = `${transaction.occurredAt.getFullYear()}-${transaction.occurredAt.getMonth()}`
    const bucket = months.find((month) => month.key === key)
    if (!bucket) continue

    if (transaction.type === "INCOME") {
      bucket.income = bucket.income.plus(transaction.amount)
    } else {
      bucket.expense = bucket.expense.plus(transaction.amount)
    }
  }

  return months.map(({ month, income, expense }) => ({
    month,
    income: income.toNumber(),
    expense: expense.toNumber(),
  }))
}

export async function getAppointmentsSummary(organizationId: string) {
  const grouped = await db.appointment.groupBy({
    by: ["status"],
    where: { organizationId },
    _count: { _all: true },
  })

  const counts: Record<string, number> = {
    SCHEDULED: 0,
    CONFIRMED: 0,
    COMPLETED: 0,
    CANCELED: 0,
    NO_SHOW: 0,
  }

  for (const row of grouped) {
    counts[row.status] = row._count._all
  }

  return counts
}

export function getRecentTransactions(organizationId: string) {
  return db.transaction.findMany({
    where: { organizationId },
    orderBy: { occurredAt: "desc" },
    take: 5,
  })
}

export function getUpcomingAppointments(organizationId: string) {
  return db.appointment.findMany({
    where: {
      organizationId,
      startsAt: { gte: new Date() },
      status: { in: [...ACTIVE_STATUSES] },
    },
    include: {
      customer: { select: { name: true } },
      service: { select: { name: true } },
      employee: { select: { name: true } },
    },
    orderBy: { startsAt: "asc" },
    take: 5,
  })
}
