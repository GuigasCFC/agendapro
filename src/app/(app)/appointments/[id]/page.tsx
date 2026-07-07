import { notFound } from "next/navigation"
import { getActiveMembership } from "@/lib/auth/dal"
import { getAppointment } from "@/features/appointments/services"
import { listCustomers } from "@/features/customers/services"
import { listServices } from "@/features/services/services"
import { listEmployees } from "@/features/employees/services"
import { AppointmentForm } from "@/features/appointments/components/appointment-form"

interface EditAppointmentPageProps {
  params: Promise<{ id: string }>
}

export default async function EditAppointmentPage({
  params,
}: EditAppointmentPageProps) {
  const { id } = await params
  const membership = await getActiveMembership()
  const organizationId = membership?.organizationId ?? ""

  const [appointment, customers, services, employees] = await Promise.all([
    membership ? getAppointment(id, organizationId) : null,
    listCustomers(organizationId),
    listServices(organizationId),
    listEmployees(organizationId),
  ])

  if (!appointment) {
    notFound()
  }

  return (
    <div className="max-w-lg space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Editar agendamento</h1>
        <p className="text-muted-foreground">
          Atualize os dados do agendamento.
        </p>
      </div>

      <AppointmentForm
        appointment={appointment}
        customers={customers.map(({ id, name }) => ({ id, name }))}
        services={services.map(({ id, name }) => ({ id, name }))}
        employees={employees.map(({ id, name }) => ({ id, name }))}
      />
    </div>
  )
}
