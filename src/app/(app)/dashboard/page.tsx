import { DollarSign, TrendingDown, TrendingUp, Users, CalendarClock } from "lucide-react"
import { getActiveMembership } from "@/lib/auth/dal"
import {
  getDashboardStats,
  getRevenueChartData,
  getAppointmentsSummary,
  getRecentTransactions,
  getUpcomingAppointments,
} from "@/features/dashboard/services"
import { StatsCard } from "@/features/dashboard/components/stats-card"
import { RevenueChart } from "@/features/dashboard/components/revenue-chart"
import { AppointmentsSummary } from "@/features/dashboard/components/appointments-summary"
import { RecentTransactions } from "@/features/dashboard/components/recent-transactions"
import { UpcomingAppointments } from "@/features/dashboard/components/upcoming-appointments"

function formatCurrency(value: number) {
  return value.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  })
}

export default async function DashboardPage() {
  const membership = await getActiveMembership()
  const organizationId = membership?.organizationId ?? ""

  const [stats, revenueChartData, appointmentsSummary, recentTransactions, upcomingAppointments] =
    await Promise.all([
      getDashboardStats(organizationId),
      getRevenueChartData(organizationId),
      getAppointmentsSummary(organizationId),
      getRecentTransactions(organizationId),
      getUpcomingAppointments(organizationId),
    ])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">
          Bem-vindo de volta! Aqui está uma visão geral da sua empresa.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-5">
        <StatsCard
          title="Receita total"
          value={formatCurrency(stats.totalRevenue)}
          icon={TrendingUp}
        />
        <StatsCard
          title="Despesas"
          value={formatCurrency(stats.totalExpenses)}
          icon={TrendingDown}
        />
        <StatsCard
          title="Lucro líquido"
          value={formatCurrency(stats.netProfit)}
          icon={DollarSign}
        />
        <StatsCard
          title="Clientes cadastrados"
          value={String(stats.customersCount)}
          icon={Users}
        />
        <StatsCard
          title="Agendamentos futuros"
          value={String(stats.upcomingAppointmentsCount)}
          icon={CalendarClock}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <RevenueChart data={revenueChartData} />
        </div>

        <AppointmentsSummary counts={appointmentsSummary} />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <RecentTransactions
          transactions={recentTransactions.map((transaction) => ({
            ...transaction,
            amount: transaction.amount.toString(),
          }))}
        />

        <UpcomingAppointments appointments={upcomingAppointments} />
      </div>
    </div>
  )
}
