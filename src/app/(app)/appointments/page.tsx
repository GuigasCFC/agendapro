import Link from "next/link"
import { getActiveMembership } from "@/lib/auth/dal"
import { listAppointments } from "@/features/appointments/services"
import { AppointmentTable } from "@/features/appointments/components/appointment-table"
import { Button } from "@/components/ui/button"

export default async function AppointmentsPage() {
  const membership = await getActiveMembership()
  const appointments = membership
    ? await listAppointments(membership.organizationId)
    : []

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Agendamentos</h1>
          <p className="text-sm text-muted-foreground">
            Gerencie os agendamentos da sua empresa.
          </p>
        </div>

        <Button render={<Link href="/appointments/new" />}>
          Novo agendamento
        </Button>
      </div>

      <AppointmentTable
        appointments={appointments.map((appointment) => ({
          id: appointment.id,
          startsAt: appointment.startsAt,
          status: appointment.status,
          customer: { name: appointment.customer.name },
          service: { name: appointment.service.name },
          employee: { name: appointment.employee.name },
        }))}
      />
    </div>
  )
}
