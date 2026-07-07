import { format } from "date-fns"
import { notFound } from "next/navigation"
import { getActiveMembership } from "@/lib/auth/dal"
import { getTransaction } from "@/features/finance/services"
import { listCustomers } from "@/features/customers/services"
import { listAppointments } from "@/features/appointments/services"
import { TransactionForm } from "@/features/finance/components/transaction-form"

interface EditTransactionPageProps {
  params: Promise<{ id: string }>
}

export default async function EditTransactionPage({
  params,
}: EditTransactionPageProps) {
  const { id } = await params
  const membership = await getActiveMembership()
  const organizationId = membership?.organizationId ?? ""

  const [transaction, customers, appointments] = await Promise.all([
    membership ? getTransaction(id, organizationId) : null,
    listCustomers(organizationId),
    listAppointments(organizationId),
  ])

  if (!transaction) {
    notFound()
  }

  return (
    <div className="max-w-lg space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Editar transação</h1>
        <p className="text-muted-foreground">
          Atualize os dados da transação.
        </p>
      </div>

      <TransactionForm
        transaction={{
          id: transaction.id,
          type: transaction.type,
          amount: transaction.amount.toString(),
          category: transaction.category,
          description: transaction.description,
          occurredAt: transaction.occurredAt,
          customerId: transaction.customerId,
          appointmentId: transaction.appointmentId,
        }}
        customers={customers.map(({ id, name }) => ({ id, name }))}
        appointments={appointments.map((appointment) => ({
          id: appointment.id,
          label: `${appointment.customer.name} - ${format(
            appointment.startsAt,
            "dd/MM/yyyy HH:mm"
          )}`,
        }))}
      />
    </div>
  )
}
