import Link from "next/link"
import { getActiveMembership } from "@/lib/auth/dal"
import { listServices } from "@/features/services/services"
import { ServiceTable } from "@/features/services/components/service-table"
import { Button } from "@/components/ui/button"

export default async function ServicesPage() {
  const membership = await getActiveMembership()
  const services = membership
    ? await listServices(membership.organizationId)
    : []

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Serviços</h1>
          <p className="text-sm text-muted-foreground">
            Gerencie os serviços oferecidos pela sua empresa.
          </p>
        </div>

        <Button render={<Link href="/services/new" />}>Novo serviço</Button>
      </div>

      <ServiceTable
        services={services.map((service) => ({
          ...service,
          price: service.price.toString(),
        }))}
      />
    </div>
  )
}
