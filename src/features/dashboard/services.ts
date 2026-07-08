import { db } from "@/lib/db"

const ACTIVE_STATUSES = ["SCHEDULED", "CONFIRMED", "COMPLETED"] as const

export async function getDashboardStats(organizationId: string) {
  const now = new Date()

  const [revenueAgg, expenseAgg, customersCount, upcomingAppointmentsCount] =
    await Promise.all([
      db.transaction.aggregate({
        where: { organizationId, type: "INCOME" },
        _sum: { amount: true },
      }),
      db.transaction.aggregate({
        where: { organizationId, type: "EXPENSE" },
        _sum: { amount: true },
      }),
      db.customer.count({ where: { organizationId } }),
      db.appointment.count({
        where: {
          organizationId,
          startsAt: { gte: now },
          status: { in: ["SCHEDULED", "CONFIRMED"] },
        },
      }),
    ])

  const totalRevenue = Number(revenueAgg._sum.amount ?? 0)
  const totalExpenses = Number(expenseAgg._sum.amount ?? 0)

  return {
    totalRevenue,
    totalExpenses,
    netProfit: totalRevenue - totalExpenses,
    customersCount,
    upcomingAppointmentsCount,
  }
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
      income: 0,
      expense: 0,
    }
  })

  for (const transaction of transactions) {
    const key = `${transaction.occurredAt.getFullYear()}-${transaction.occurredAt.getMonth()}`
    const bucket = months.find((month) => month.key === key)
    if (!bucket) continue

    const amount = Number(transaction.amount)
    if (transaction.type === "INCOME") {
      bucket.income += amount
    } else {
      bucket.expense += amount
    }
  }

  return months.map(({ month, income, expense }) => ({
    month,
    income,
    expense,
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
    include: { customer: true, service: true, employee: true },
    orderBy: { startsAt: "asc" },
    take: 5,
  })
}
