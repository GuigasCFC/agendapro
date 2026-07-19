"use client"

import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { EmptyState } from "@/components/ui/empty-state"
import { TrendingUp } from "lucide-react"
import type { RevenuePoint } from "@/features/reports/services"
import { formatCurrency } from "@/lib/format"

interface RevenueChartProps {
  data: RevenuePoint[]
}

export function RevenueChart({ data }: RevenueChartProps) {
  const hasRevenue = data.some((point) => point.total > 0)

  const chartData = data.map((point) => ({
    label: format(point.date, "dd/MM", { locale: ptBR }),
    total: point.total,
  }))

  return (
    <Card>
      <CardHeader>
        <CardTitle>Receita por dia</CardTitle>
      </CardHeader>

      <CardContent>
        {!hasRevenue ? (
          <EmptyState icon={TrendingUp} title="Nenhuma receita registrada no período." />
        ) : (
          <ResponsiveContainer width="100%" height={280}>
            <LineChart
              data={chartData}
              role="img"
              aria-label="Gráfico de linha: receita por dia no período selecionado"
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
                tickFormatter={(value: number) => formatCurrency(value, { maximumFractionDigits: 0 })}
                width={90}
              />
              <Tooltip
                cursor={{ stroke: "var(--muted-foreground)", strokeOpacity: 0.3 }}
                formatter={(value) => [formatCurrency(Number(value), { maximumFractionDigits: 0 }), "Receita"]}
                contentStyle={{
                  backgroundColor: "var(--popover)",
                  borderColor: "var(--border)",
                  borderRadius: "var(--radius-lg)",
                  boxShadow: "0 4px 16px -4px oklch(0 0 0 / 0.12)",
                  color: "var(--popover-foreground)",
                }}
              />
              <Line
                type="monotone"
                dataKey="total"
                name="Receita"
                stroke="var(--color-chart-1)"
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  )
}
