"use client"

import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { EmptyState } from "@/components/ui/empty-state"
import { CalendarClock } from "lucide-react"
import type { AppointmentCountPoint } from "@/features/reports/services"

interface AppointmentsChartProps {
  data: AppointmentCountPoint[]
}

export function AppointmentsChart({ data }: AppointmentsChartProps) {
  const hasAppointments = data.some((point) => point.count > 0)

  const chartData = data.map((point) => ({
    label: format(point.date, "dd/MM", { locale: ptBR }),
    count: point.count,
  }))

  return (
    <Card>
      <CardHeader>
        <CardTitle>Agendamentos por dia</CardTitle>
      </CardHeader>

      <CardContent>
        {!hasAppointments ? (
          <EmptyState icon={CalendarClock} title="Nenhum agendamento no período." />
        ) : (
          <ResponsiveContainer width="100%" height={280}>
            <BarChart
              data={chartData}
              barCategoryGap="24%"
              role="img"
              aria-label="Gráfico de barras: agendamentos por dia no período selecionado"
            >
              <CartesianGrid
                vertical={false}
                stroke="var(--border)"
                strokeDasharray="0"
                strokeOpacity={0.6}
              />
              <XAxis
                dataKey="label"
                stroke="var(--muted-foreground)"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                minTickGap={24}
              />
              <YAxis
                stroke="var(--muted-foreground)"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                allowDecimals={false}
                width={40}
              />
              <Tooltip
                cursor={{ fill: "var(--muted)" }}
                formatter={(value) => [String(value), "Agendamentos"]}
                contentStyle={{
                  backgroundColor: "var(--popover)",
                  borderColor: "var(--border)",
                  borderRadius: "var(--radius-lg)",
                  boxShadow: "0 4px 16px -4px oklch(0 0 0 / 0.12)",
                  color: "var(--popover-foreground)",
                }}
              />
              <Bar
                dataKey="count"
                name="Agendamentos"
                fill="var(--color-chart-2)"
                radius={[6, 6, 0, 0]}
                maxBarSize={22}
              />
            </BarChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  )
}
