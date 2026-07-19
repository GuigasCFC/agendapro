"use client"

import { useMemo, useState } from "react"
import Link from "next/link"
import { format } from "date-fns"
import { Calendar, Pencil } from "lucide-react"
import { deleteAppointment } from "@/features/appointments/actions"
import { Button } from "@/components/ui/button"
import { Badge, type badgeVariants } from "@/components/ui/badge"
import { DeleteRowButton } from "@/components/ui/delete-row-button"
import { EmptyState } from "@/components/ui/empty-state"
import { TableToolbar } from "@/components/ui/table-toolbar"
import { TablePagination } from "@/components/ui/table-pagination"
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from "@/components/ui/table"
import type { VariantProps } from "class-variance-authority"

const STATUS_LABELS: Record<string, string> = {
  SCHEDULED: "Agendado",
  CONFIRMED: "Confirmado",
  COMPLETED: "Concluído",
  CANCELED: "Cancelado",
  NO_SHOW: "Não compareceu",
}

const STATUS_VARIANTS: Record<
  string,
  NonNullable<VariantProps<typeof badgeVariants>["variant"]>
> = {
  SCHEDULED: "outline",
  CONFIRMED: "info",
  COMPLETED: "success",
  CANCELED: "destructive",
  NO_SHOW: "warning",
}

interface AppointmentTableProps {
  appointments: {
    id: string
    startsAt: Date
    status: string
    customer: { name: string }
    service: { name: string }
    employee: { name: string }
  }[]
}

export function AppointmentTable({ appointments }: AppointmentTableProps) {
  const [search, setSearch] = useState("")

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase()
    if (!query) return appointments

    return appointments.filter((appointment) =>
      [
        appointment.customer.name,
        appointment.service.name,
        appointment.employee.name,
      ].some((value) => value.toLowerCase().includes(query))
    )
  }, [appointments, search])

  if (appointments.length === 0) {
    return (
      <EmptyState icon={Calendar} title="Nenhum agendamento cadastrado ainda." />
    )
  }

  return (
    <div className="space-y-4">
      <TableToolbar
        value={search}
        onValueChange={setSearch}
        placeholder="Buscar por cliente, serviço ou funcionário..."
      />

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Cliente</TableHead>
            <TableHead>Serviço</TableHead>
            <TableHead>Funcionário</TableHead>
            <TableHead>Data</TableHead>
            <TableHead>Horário</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Ações</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {filtered.map((appointment) => (
            <TableRow key={appointment.id}>
              <TableCell className="max-w-[180px] truncate font-medium">
                {appointment.customer.name}
              </TableCell>
              <TableCell className="max-w-[160px] truncate text-muted-foreground">
                {appointment.service.name}
              </TableCell>
              <TableCell className="max-w-[160px] truncate text-muted-foreground">
                {appointment.employee.name}
              </TableCell>
              <TableCell className="font-mono text-muted-foreground">
                {format(appointment.startsAt, "dd/MM/yyyy")}
              </TableCell>
              <TableCell className="font-mono text-muted-foreground">
                {format(appointment.startsAt, "HH:mm")}
              </TableCell>
              <TableCell>
                <Badge variant={STATUS_VARIANTS[appointment.status] ?? "secondary"}>
                  {STATUS_LABELS[appointment.status] ?? appointment.status}
                </Badge>
              </TableCell>
              <TableCell className="flex justify-end gap-1">
                <Button
                  variant="ghost"
                  size="icon-sm"
                  render={<Link href={`/appointments/${appointment.id}`} />}
                  aria-label={`Editar agendamento de ${appointment.customer.name}`}
                  title="Editar"
                >
                  <Pencil className="h-4 w-4" />
                </Button>

                <form action={deleteAppointment.bind(null, appointment.id)}>
                  <DeleteRowButton
                    label={`Excluir agendamento de ${appointment.customer.name}`}
                  />
                </form>
              </TableCell>
            </TableRow>
          ))}

          {filtered.length === 0 && (
            <TableRow>
              <TableCell
                colSpan={7}
                className="h-24 text-center text-muted-foreground"
              >
                Nenhum resultado para &quot;{search}&quot;.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>

      <TablePagination shown={filtered.length} total={appointments.length} />
    </div>
  )
}
