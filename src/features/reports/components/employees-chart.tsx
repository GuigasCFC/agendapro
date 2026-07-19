"use client"

import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { EmptyState } from "@/components/ui/empty-state"
import { UserCog } from "lucide-react"
import type { ReportRankingRow } from "@/features/reports/services"
import { formatCurrency } from "@/lib/format"

interface EmployeesChartProps {
  data: ReportRankingRow[]
}

export function EmployeesChart({ data }: EmployeesChartProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Funcionários</CardTitle>
      </CardHeader>

      <CardContent>
        {data.length === 0 ? (
          <EmptyState icon={UserCog} title="Nenhum atendimento concluído no período." />
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart
              data={data}
              barGap={4}
              role="img"
              aria-label="Gráfico de barras: atendimentos e receita por funcionário"
            >
              <CartesianGrid
                vertical={false}
                stroke="var(--border)"
                strokeDasharray="0"
                strokeOpacity={0.6}
              />
              <XAxis
                dataKey="name"
                stroke="var(--muted-foreground)"
                fontSize={12}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                yAxisId="count"
                stroke="var(--muted-foreground)"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                allowDecimals={false}
                width={36}
              />
              <YAxis
                yAxisId="revenue"
                orientation="right"
                stroke="var(--muted-foreground)"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                tickFormatter={(value: number) => formatCurrency(value, { maximumFractionDigits: 0 })}
                width={90}
              />
              <Tooltip
                cursor={{ fill: "var(--muted)" }}
                formatter={(value, name) =>
                  name === "Receita"
                    ? [formatCurrency(Number(value), { maximumFractionDigits: 0 }), name]
                    : [String(value), name]
                }
                contentStyle={{
                  backgroundColor: "var(--popover)",
                  borderColor: "var(--border)",
                  borderRadius: "var(--radius-lg)",
                  boxShadow: "0 4px 16px -4px oklch(0 0 0 / 0.12)",
                  color: "var(--popover-foreground)",
                }}
              />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              <Bar
                yAxisId="count"
                dataKey="count"
                name="Atendimentos"
                fill="var(--color-chart-4)"
                radius={[6, 6, 0, 0]}
                maxBarSize={24}
              />
              <Bar
                yAxisId="revenue"
                dataKey="revenue"
                name="Receita"
                fill="var(--color-chart-5)"
                radius={[6, 6, 0, 0]}
                maxBarSize={24}
              />
            </BarChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  )
}
