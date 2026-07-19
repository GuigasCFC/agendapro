import dynamic from "next/dynamic"
import { Scissors, UserCog, Users } from "lucide-react"

import { getActiveMembership } from "@/lib/auth/dal"
import {
  getAppointmentsReport,
  getDashboardKPIs,
  getEmployeesReport,
  getRevenueReport,
  getServicesReport,
} from "@/features/reports/services"
import {
  isReportPeriod,
  resolveFilters,
  resolvePeriod,
  type ReportPeriod,
} from "@/features/reports/schemas"
import { listEmployees } from "@/features/employees/services"
import { listServices } from "@/features/services/services"
import { KpiCards } from "@/features/reports/components/kpi-cards"
import { ReportsFilters } from "@/features/reports/components/reports-filters"
import { RankingTable } from "@/features/reports/components/ranking-table"
import { ExportButtons } from "@/features/reports/components/export-buttons"
import { Skeleton } from "@/components/ui/skeleton"

// recharts é pesado; separado do bundle inicial de /reports e carregado só
// quando cada gráfico entra em cena.
const CHART_LOADING = () => <Skeleton className="h-72 rounded-2xl" />

const RevenueChart = dynamic(() =>
  import("@/features/reports/components/revenue-chart").then((mod) => mod.RevenueChart)
, { loading: CHART_LOADING })

const AppointmentsChart = dynamic(() =>
  import("@/features/reports/components/appointments-chart").then((mod) => mod.AppointmentsChart)
, { loading: CHART_LOADING })

const ServicesChart = dynamic(() =>
  import("@/features/reports/components/services-chart").then((mod) => mod.ServicesChart)
, { loading: CHART_LOADING })

const EmployeesChart = dynamic(() =>
  import("@/features/reports/components/employees-chart").then((mod) => mod.EmployeesChart)
, { loading: CHART_LOADING })

interface ReportsPageProps {
  searchParams: Promise<{
    period?: string
    from?: string
    to?: string
    employeeId?: string
    serviceId?: string
  }>
}

export default async function ReportsPage({ searchParams }: ReportsPageProps) {
  const params = await searchParams
  const period: ReportPeriod = isReportPeriod(params.period) ? params.period : "month"
  const range = resolvePeriod(period, params.from, params.to)
  const filters = resolveFilters(params)

  const membership = await getActiveMembership()
  const organizationId = membership?.organizationId ?? ""

  const [kpis, revenue, appointments, services, employees, allEmployees, allServices] =
    await Promise.all([
      getDashboardKPIs(organizationId, range, filters),
      getRevenueReport(organizationId, range, filters),
      getAppointmentsReport(organizationId, range, filters),
      getServicesReport(organizationId, range, filters),
      getEmployeesReport(organizationId, range, filters),
      listEmployees(organizationId),
      listServices(organizationId),
    ])

  const exportQuery = new URLSearchParams()
  exportQuery.set("period", period)
  if (period === "custom" && params.from) exportQuery.set("from", params.from)
  if (period === "custom" && params.to) exportQuery.set("to", params.to)
  if (filters.employeeId) exportQuery.set("employeeId", filters.employeeId)
  if (filters.serviceId) exportQuery.set("serviceId", filters.serviceId)

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">
            Relatórios
          </h1>
          <p className="text-sm text-muted-foreground">
            Desempenho da sua empresa no período selecionado.
          </p>
        </div>

        <ExportButtons query={exportQuery.toString()} />
      </div>

      <ReportsFilters
        period={period}
        from={params.from}
        to={params.to}
        employeeId={filters.employeeId}
        serviceId={filters.serviceId}
        employees={allEmployees.filter((employee) => employee.active)}
        services={allServices.filter((service) => service.active)}
      />

      <KpiCards kpis={kpis} />

      <div className="grid gap-4 lg:grid-cols-2">
        <RevenueChart data={revenue} />
        <AppointmentsChart data={appointments} />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <ServicesChart data={services} />
        <EmployeesChart data={employees} />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <RankingTable
          title="Top serviços"
          emptyIcon={Scissors}
          emptyLabel="Nenhum serviço concluído no período."
          countLabel="atendimentos"
          rows={services}
        />
        <RankingTable
          title="Top funcionários"
          emptyIcon={UserCog}
          emptyLabel="Nenhum atendimento concluído no período."
          countLabel="atendimentos"
          rows={employees}
        />
        <RankingTable
          title="Clientes recorrentes"
          emptyIcon={Users}
          emptyLabel="Nenhum cliente recorrente no período."
          countLabel="atendimentos"
          rows={kpis.recurringCustomers}
        />
      </div>
    </div>
  )
}
