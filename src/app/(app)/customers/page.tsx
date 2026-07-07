import Link from "next/link"
import { getActiveMembership } from "@/lib/auth/dal"
import { listCustomers } from "@/features/customers/services"
import { CustomerTable } from "@/features/customers/components/customer-table"
import { Button } from "@/components/ui/button"

export default async function CustomersPage() {
  const membership = await getActiveMembership()
  const customers = membership
    ? await listCustomers(membership.organizationId)
    : []

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Clientes</h1>
          <p className="text-muted-foreground">
            Gerencie os clientes da sua empresa.
          </p>
        </div>

        <Button render={<Link href="/customers/new" />}>Novo cliente</Button>
      </div>

      <CustomerTable customers={customers} />
    </div>
  )
}
