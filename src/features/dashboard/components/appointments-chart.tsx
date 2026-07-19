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

interface AppointmentsChartProps {
  data: {
    date: Date
    count: number
  }[]
}

export function AppointmentsChart({ data }: AppointmentsChartProps) {
  const chartData = data.map((item) => ({
    label: format(item.date, "EEE", { locale: ptBR }),
    Agendamentos: item.count,
  }))

  return (
    <Card>
      <CardHeader>
        <CardTitle>Agendamentos dos últimos 7 dias</CardTitle>
      </CardHeader>

      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart
            data={chartData}
            barCategoryGap="24%"
            role="img"
            aria-label="Gráfico de barras: agendamentos dos últimos 7 dias"
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
            />
            <YAxis
              stroke="var(--muted-foreground)"
              fontSize={12}
              tickLine={false}
              axisLine={false}
              allowDecimals={false}
              width={32}
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
              dataKey="Agendamentos"
              fill="var(--color-chart-3)"
              radius={[6, 6, 0, 0]}
              maxBarSize={28}
            />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
