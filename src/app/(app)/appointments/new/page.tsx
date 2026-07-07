import { getActiveMembership } from "@/lib/auth/dal"
import { listCustomers } from "@/features/customers/services"
import { listServices } from "@/features/services/services"
import { listEmployees } from "@/features/employees/services"
import { AppointmentForm } from "@/features/appointments/components/appointment-form"

export default async function NewAppointmentPage() {
  const membership = await getActiveMembership()
  const organizationId = membership?.organizationId ?? ""

  const [customers, services, employees] = await Promise.all([
    listCustomers(organizationId),
    listServices(organizationId),
    listEmployees(organizationId),
  ])

  return (
    <div className="max-w-lg space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Novo agendamento</h1>
        <p className="text-muted-foreground">
          Cadastre um novo agendamento da sua empresa.
        </p>
      </div>

      <AppointmentForm
        customers={customers.map(({ id, name }) => ({ id, name }))}
        services={services.map(({ id, name }) => ({ id, name }))}
        employees={employees.map(({ id, name }) => ({ id, name }))}
      />
    </div>
  )
}
