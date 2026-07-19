"use client"

import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { EmptyState } from "@/components/ui/empty-state"
import { Scissors } from "lucide-react"
import type { ReportRankingRow } from "@/features/reports/services"

interface ServicesChartProps {
  data: ReportRankingRow[]
}

export function ServicesChart({ data }: ServicesChartProps) {
  const chartData = [...data].reverse()

  return (
    <Card>
      <CardHeader>
        <CardTitle>Serviços mais vendidos</CardTitle>
      </CardHeader>

      <CardContent>
        {data.length === 0 ? (
          <EmptyState icon={Scissors} title="Nenhum serviço concluído no período." />
        ) : (
          <ResponsiveContainer width="100%" height={Math.max(220, chartData.length * 36)}>
            <BarChart
              data={chartData}
              layout="vertical"
              margin={{ left: 8 }}
              role="img"
              aria-label="Gráfico de barras: serviços mais vendidos no período"
            >
              <CartesianGrid
                horizontal={false}
                stroke="var(--border)"
                strokeDasharray="0"
                strokeOpacity={0.6}
              />
              <XAxis
                type="number"
                stroke="var(--muted-foreground)"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                allowDecimals={false}
              />
              <YAxis
                type="category"
                dataKey="name"
                stroke="var(--muted-foreground)"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                width={140}
              />
              <Tooltip
                cursor={{ fill: "var(--muted)" }}
                formatter={(value) => [String(value), "Atendimentos"]}
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
                name="Atendimentos"
                fill="var(--color-chart-3)"
                radius={[0, 6, 6, 0]}
                maxBarSize={20}
              />
            </BarChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  )
}
