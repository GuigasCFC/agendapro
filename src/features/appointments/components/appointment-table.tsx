import Link from "next/link"
import { format } from "date-fns"
import { Pencil, Trash2 } from "lucide-react"
import { deleteAppointment } from "@/features/appointments/actions"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from "@/components/ui/table"

const STATUS_LABELS: Record<string, string> = {
  SCHEDULED: "Agendado",
  CONFIRMED: "Confirmado",
  COMPLETED: "Concluído",
  CANCELED: "Cancelado",
  NO_SHOW: "Não compareceu",
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
  if (appointments.length === 0) {
    return (
      <div className="flex h-40 items-center justify-center rounded-lg border border-dashed text-muted-foreground">
        Nenhum agendamento cadastrado ainda.
      </div>
    )
  }

  return (
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
        {appointments.map((appointment) => (
          <TableRow key={appointment.id}>
            <TableCell className="font-medium">
              {appointment.customer.name}
            </TableCell>
            <TableCell>{appointment.service.name}</TableCell>
            <TableCell>{appointment.employee.name}</TableCell>
            <TableCell>{format(appointment.startsAt, "dd/MM/yyyy")}</TableCell>
            <TableCell>{format(appointment.startsAt, "HH:mm")}</TableCell>
            <TableCell>
              <Badge variant="secondary">
                {STATUS_LABELS[appointment.status] ?? appointment.status}
              </Badge>
            </TableCell>
            <TableCell className="flex justify-end gap-1">
              <Button
                variant="ghost"
                size="icon-sm"
                render={<Link href={`/appointments/${appointment.id}`} />}
              >
                <Pencil className="h-4 w-4" />
              </Button>

              <form action={deleteAppointment.bind(null, appointment.id)}>
                <Button variant="ghost" size="icon-sm" type="submit">
                  <Trash2 className="h-4 w-4" />
                </Button>
              </form>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
