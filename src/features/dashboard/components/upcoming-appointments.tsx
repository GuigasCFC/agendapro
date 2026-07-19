import { format } from "date-fns"
import { CalendarClock } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { EmptyState } from "@/components/ui/empty-state"

interface UpcomingAppointmentsProps {
  appointments: {
    id: string
    startsAt: Date
    customer: { name: string }
    service: { name: string }
    employee: { name: string }
  }[]
}

export function UpcomingAppointments({
  appointments,
}: UpcomingAppointmentsProps) {
  if (appointments.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Próximos agendamentos</CardTitle>
        </CardHeader>
        <CardContent>
          <EmptyState icon={CalendarClock} title="Nenhum agendamento futuro." />
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Próximos agendamentos</CardTitle>
      </CardHeader>

      <CardContent className="space-y-2">
        {appointments.map((appointment) => (
          <div
            key={appointment.id}
            className="flex items-center gap-3 rounded-lg border border-transparent p-3 transition-colors hover:border-border hover:bg-muted/50"
          >
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
              {appointment.customer.name.charAt(0).toUpperCase()}
            </div>

            <div className="min-w-0 flex-1">
              <p className="truncate font-medium text-foreground">
                {appointment.customer.name}
              </p>
              <p className="truncate text-sm text-muted-foreground">
                {appointment.service.name} · {appointment.employee.name}
              </p>
            </div>

            <span className="shrink-0 font-mono text-sm font-semibold text-foreground">
              {format(appointment.startsAt, "dd/MM HH:mm")}
            </span>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
