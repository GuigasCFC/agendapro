import { notFound } from "next/navigation"
import { getActiveMembership } from "@/lib/auth/dal"
import { getCustomer } from "@/features/customers/services"
import { CustomerForm } from "@/features/customers/components/customer-form"

interface EditCustomerPageProps {
  params: Promise<{ id: string }>
}

export default async function EditCustomerPage({ params }: EditCustomerPageProps) {
  const { id } = await params
  const membership = await getActiveMembership()
  const customer = membership
    ? await getCustomer(membership.organizationId, id)
    : null

  if (!customer) {
    notFound()
  }

  return (
    <div className="max-w-lg space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Editar cliente</h1>
        <p className="text-muted-foreground">Atualize os dados do cliente.</p>
      </div>

      <CustomerForm customer={customer} />
    </div>
  )
}
