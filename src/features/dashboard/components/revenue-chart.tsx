"use client"

import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
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

interface RevenueChartProps {
  data: {
    month: Date
    income: number
    expense: number
  }[]
}

function formatCurrency(value: number) {
  return value.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
    maximumFractionDigits: 0,
  })
}

export function RevenueChart({ data }: RevenueChartProps) {
  const chartData = data.map((item) => ({
    label: format(item.month, "MMM", { locale: ptBR }),
    Receita: item.income,
    Despesa: item.expense,
  }))

  return (
    <Card>
      <CardHeader>
        <CardTitle>Receitas x Despesas</CardTitle>
      </CardHeader>

      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chartData} barCategoryGap="20%" barGap={2}>
            <CartesianGrid
              vertical={false}
              stroke="var(--border)"
              strokeDasharray="0"
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
              tickFormatter={(value: number) => formatCurrency(value)}
              width={90}
            />
            <Tooltip
              cursor={{ fill: "var(--muted)" }}
              formatter={(value) => formatCurrency(Number(value))}
              contentStyle={{
                backgroundColor: "var(--popover)",
                borderColor: "var(--border)",
                borderRadius: "var(--radius-md)",
                color: "var(--popover-foreground)",
              }}
            />
            <Legend wrapperStyle={{ fontSize: 12 }} />
            <Bar
              dataKey="Receita"
              fill="var(--color-chart-1)"
              radius={[4, 4, 0, 0]}
              maxBarSize={24}
            />
            <Bar
              dataKey="Despesa"
              fill="var(--color-chart-2)"
              radius={[4, 4, 0, 0]}
              maxBarSize={24}
            />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
