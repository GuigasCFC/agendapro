import { CalendarClock, DollarSign, Scissors, TrendingUp, Users, Wallet } from "lucide-react"

import { StatsCard } from "@/features/dashboard/components/stats-card"
import type { ReportKPIs } from "@/features/reports/services"
import { formatCurrency } from "@/lib/format"

interface KpiCardsProps {
  kpis: ReportKPIs
}

export function KpiCards({ kpis }: KpiCardsProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      <StatsCard
        title="Receita total"
        value={formatCurrency(kpis.totalRevenue)}
        icon={DollarSign}
        tone="primary"
      />
      <StatsCard
        title="Receita do período"
        value={formatCurrency(kpis.periodRevenue)}
        icon={TrendingUp}
        tone="success"
      />
      <StatsCard
        title="Agendamentos"
        value={String(kpis.appointmentsCount)}
        icon={CalendarClock}
        tone="info"
      />
      <StatsCard
        title="Ticket médio"
        value={formatCurrency(kpis.averageTicket)}
        icon={Wallet}
        tone="primary"
      />
      <StatsCard
        title="Clientes atendidos"
        value={String(kpis.customersServed)}
        icon={Users}
        tone="info"
      />
      <StatsCard
        title="Serviços realizados"
        value={String(kpis.servicesCompleted)}
        icon={Scissors}
        tone="success"
      />
    </div>
  )
}
