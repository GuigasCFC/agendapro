import dynamic from "next/dynamic"
import { CalendarCheck, DollarSign, Scissors, Users } from "lucide-react"
import { getActiveMembership } from "@/lib/auth/dal"
import {
  getDashboardStats,
  getRevenueChartData,
  getAppointmentsLast7Days,
  getAppointmentsSummary,
  getRecentTransactions,
  getUpcomingAppointments,
} from "@/features/dashboard/services"
import { StatsCard } from "@/features/dashboard/components/stats-card"
import { AppointmentsSummary } from "@/features/dashboard/components/appointments-summary"
import { RecentTransactions } from "@/features/dashboard/components/recent-transactions"
import { UpcomingAppointments } from "@/features/dashboard/components/upcoming-appointments"
import { Skeleton } from "@/components/ui/skeleton"
import { formatCurrency } from "@/lib/format"

// recharts é pesado; separado do bundle inicial do dashboard e carregado
// só quando o gráfico entra em cena.
const RevenueChart = dynamic(() =>
  import("@/features/dashboard/components/revenue-chart").then((mod) => mod.RevenueChart)
, { loading: () => <Skeleton className="h-72 rounded-2xl" /> })

const AppointmentsChart = dynamic(() =>
  import("@/features/dashboard/components/appointments-chart").then((mod) => mod.AppointmentsChart)
, { loading: () => <Skeleton className="h-72 rounded-2xl" /> })

export default async function DashboardPage() {
  const membership = await getActiveMembership()
  const organizationId = membership?.organizationId ?? ""

  const [
    stats,
    revenueChartData,
    appointmentsLast7Days,
    appointmentsSummary,
    recentTransactions,
    upcomingAppointments,
  ] = await Promise.all([
    getDashboardStats(organizationId),
    getRevenueChartData(organizationId),
    getAppointmentsLast7Days(organizationId),
    getAppointmentsSummary(organizationId),
    getRecentTransactions(organizationId),
    getUpcomingAppointments(organizationId),
  ])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">
          Dashboard
        </h1>
        <p className="text-sm text-muted-foreground">
          Bem-vindo de volta! Aqui está uma visão geral da sua empresa.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatsCard
          title="Agendamentos hoje"
          value={String(stats.appointmentsToday)}
          icon={CalendarCheck}
          tone="info"
        />
        <StatsCard
          title="Clientes cadastrados"
          value={String(stats.customersCount)}
          icon={Users}
          tone="info"
        />
        <StatsCard
          title="Receita do mês"
          value={formatCurrency(stats.revenueThisMonth)}
          icon={DollarSign}
          tone="success"
        />
        <StatsCard
          title="Serviços ativos"
          value={String(stats.activeServicesCount)}
          icon={Scissors}
          tone="primary"
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <RevenueChart data={revenueChartData} />
        <AppointmentsChart data={appointmentsLast7Days} />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <AppointmentsSummary counts={appointmentsSummary} />
        <RecentTransactions
          transactions={recentTransactions.map((transaction) => ({
            ...transaction,
            amount: transaction.amount.toString(),
          }))}
        />
      </div>

      <UpcomingAppointments appointments={upcomingAppointments} />
    </div>
  )
}
