"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { Search } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  NOTIFICATION_CHANNEL_OPTIONS,
  NOTIFICATION_STATUS_OPTIONS,
  NOTIFICATION_TYPE_OPTIONS,
} from "@/features/notifications/schemas"

interface NotificationFiltersProps {
  type?: string
  channel?: string
  status?: string
  from?: string
  to?: string
  q?: string
}

export function NotificationFilters({
  type,
  channel,
  status,
  from,
  to,
  q,
}: NotificationFiltersProps) {
  const router = useRouter()
  const [values, setValues] = useState({
    type: type ?? "all",
    channel: channel ?? "all",
    status: status ?? "all",
    from: from ?? "",
    to: to ?? "",
    q: q ?? "",
  })

  function applyFilters() {
    const params = new URLSearchParams()
    if (values.type !== "all") params.set("type", values.type)
    if (values.channel !== "all") params.set("channel", values.channel)
    if (values.status !== "all") params.set("status", values.status)
    if (values.from) params.set("from", values.from)
    if (values.to) params.set("to", values.to)
    if (values.q) params.set("q", values.q)

    const query = params.toString()
    router.push(query ? `/notifications?${query}` : "/notifications")
  }

  const hasActiveFilters = Boolean(type || channel || status || from || to || q)

  return (
    <Card>
      <CardContent className="space-y-3">
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <div className="relative sm:col-span-2 lg:col-span-1">
          <Search className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={values.q}
            onChange={(event) =>
              setValues((prev) => ({ ...prev, q: event.target.value }))
            }
            placeholder="Buscar por cliente ou destinatário..."
            className="pl-9"
          />
        </div>

        <Select
          value={values.type}
          onValueChange={(value) =>
            setValues((prev) => ({ ...prev, type: value ?? "all" }))
          }
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Tipo" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os tipos</SelectItem>
            {NOTIFICATION_TYPE_OPTIONS.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={values.channel}
          onValueChange={(value) =>
            setValues((prev) => ({ ...prev, channel: value ?? "all" }))
          }
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Canal" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os canais</SelectItem>
            {NOTIFICATION_CHANNEL_OPTIONS.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={values.status}
          onValueChange={(value) =>
            setValues((prev) => ({ ...prev, status: value ?? "all" }))
          }
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os status</SelectItem>
            {NOTIFICATION_STATUS_OPTIONS.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <Input
          type="date"
          value={values.from}
          onChange={(event) =>
            setValues((prev) => ({ ...prev, from: event.target.value }))
          }
          className="w-40"
          aria-label="Data inicial"
        />
        <span className="text-sm text-muted-foreground">até</span>
        <Input
          type="date"
          value={values.to}
          onChange={(event) =>
            setValues((prev) => ({ ...prev, to: event.target.value }))
          }
          className="w-40"
          aria-label="Data final"
        />

        <Button type="button" size="sm" onClick={applyFilters}>
          Aplicar filtros
        </Button>

        {hasActiveFilters && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            render={<Link href="/notifications" />}
          >
            Limpar filtros
          </Button>
        )}
      </div>
      </CardContent>
    </Card>
  )
}
