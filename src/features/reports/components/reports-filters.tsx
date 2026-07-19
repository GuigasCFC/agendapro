"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState } from "react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { cn } from "@/lib/utils"
import { PERIOD_OPTIONS, type ReportPeriod } from "@/features/reports/schemas"

interface ReportsFiltersProps {
  period: ReportPeriod
  from?: string
  to?: string
  employeeId?: string
  serviceId?: string
  employees: { id: string; name: string }[]
  services: { id: string; name: string }[]
}

export function ReportsFilters({
  period,
  from,
  to,
  employeeId,
  serviceId,
  employees,
  services,
}: ReportsFiltersProps) {
  const router = useRouter()
  const [customFrom, setCustomFrom] = useState(from ?? "")
  const [customTo, setCustomTo] = useState(to ?? "")
  const [employee, setEmployee] = useState(employeeId ?? "all")
  const [service, setService] = useState(serviceId ?? "all")

  function buildQuery(nextPeriod: ReportPeriod) {
    const params = new URLSearchParams()
    params.set("period", nextPeriod)

    if (nextPeriod === "custom" && customFrom) params.set("from", customFrom)
    if (nextPeriod === "custom" && customTo) params.set("to", customTo)
    if (employee !== "all") params.set("employeeId", employee)
    if (service !== "all") params.set("serviceId", service)

    return params.toString()
  }

  const hasActiveExtraFilters = Boolean(employeeId || serviceId)

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center gap-1 rounded-lg border border-border bg-muted/30 p-1">
        {PERIOD_OPTIONS.map((option) => (
          <Link
            key={option.value}
            href={`/reports?${buildQuery(option.value)}`}
            aria-current={period === option.value ? "page" : undefined}
            className={cn(
              "rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
              period === option.value
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            {option.label}
          </Link>
        ))}
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {period === "custom" && (
          <>
            <Input
              type="date"
              value={customFrom}
              onChange={(event) => setCustomFrom(event.target.value)}
              className="w-40"
              aria-label="Data inicial"
            />
            <span className="text-sm text-muted-foreground">até</span>
            <Input
              type="date"
              value={customTo}
              onChange={(event) => setCustomTo(event.target.value)}
              className="w-40"
              aria-label="Data final"
            />
          </>
        )}

        <Select value={employee} onValueChange={(value) => setEmployee(value ?? "all")}>
          <SelectTrigger className="w-48" aria-label="Funcionário">
            <SelectValue placeholder="Funcionário" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os funcionários</SelectItem>
            {employees.map((item) => (
              <SelectItem key={item.id} value={item.id}>
                {item.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={service} onValueChange={(value) => setService(value ?? "all")}>
          <SelectTrigger className="w-48" aria-label="Serviço">
            <SelectValue placeholder="Serviço" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os serviços</SelectItem>
            {services.map((item) => (
              <SelectItem key={item.id} value={item.id}>
                {item.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Button type="button" size="sm" onClick={() => router.push(`/reports?${buildQuery(period)}`)}>
          Aplicar
        </Button>

        {hasActiveExtraFilters && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            render={<Link href={`/reports?period=${period}`} />}
          >
            Limpar filtros
          </Button>
        )}
      </div>
    </div>
  )
}
