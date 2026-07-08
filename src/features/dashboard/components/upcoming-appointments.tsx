import { format } from "date-fns"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

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
          <div className="flex h-32 items-center justify-center rounded-lg border border-dashed text-muted-foreground">
            Nenhum agendamento futuro.
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Próximos agendamentos</CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        {appointments.map((appointment) => (
          <div
            key={appointment.id}
            className="flex items-center justify-between rounded-lg border p-3"
          >
            <div>
              <p className="font-medium">{appointment.customer.name}</p>
              <p className="text-sm text-muted-foreground">
                {appointment.service.name} · {appointment.employee.name}
              </p>
            </div>

            <span className="text-sm font-semibold">
              {format(appointment.startsAt, "dd/MM HH:mm")}
            </span>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
