import { format } from "date-fns"
import { getActiveMembership } from "@/lib/auth/dal"
import { listCustomers } from "@/features/customers/services"
import { listAppointments } from "@/features/appointments/services"
import { TransactionForm } from "@/features/finance/components/transaction-form"
import { Card, CardContent } from "@/components/ui/card"

export default async function NewTransactionPage() {
  const membership = await getActiveMembership()
  const organizationId = membership?.organizationId ?? ""

  const [customers, appointments] = await Promise.all([
    listCustomers(organizationId),
    listAppointments(organizationId),
  ])

  return (
    <div className="max-w-lg space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Nova transação</h1>
        <p className="text-sm text-muted-foreground">
          Registre uma receita ou despesa da sua empresa.
        </p>
      </div>

      <Card>
        <CardContent>
          <TransactionForm
            customers={customers.map(({ id, name }) => ({ id, name }))}
            appointments={appointments.map((appointment) => ({
              id: appointment.id,
              label: `${appointment.customer.name} - ${format(
                appointment.startsAt,
                "dd/MM/yyyy HH:mm"
              )}`,
            }))}
          />
        </CardContent>
      </Card>
    </div>
  )
}
