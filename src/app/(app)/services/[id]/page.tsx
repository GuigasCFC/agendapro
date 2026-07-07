import { notFound } from "next/navigation"
import { getActiveMembership } from "@/lib/auth/dal"
import { getService } from "@/features/services/services"
import { ServiceForm } from "@/features/services/components/service-form"

interface EditServicePageProps {
  params: Promise<{ id: string }>
}

export default async function EditServicePage({ params }: EditServicePageProps) {
  const { id } = await params
  const membership = await getActiveMembership()
  const service = membership
    ? await getService(id, membership.organizationId)
    : null

  if (!service) {
    notFound()
  }

  return (
    <div className="max-w-lg space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Editar serviço</h1>
        <p className="text-muted-foreground">Atualize os dados do serviço.</p>
      </div>

      <ServiceForm
        service={{
          id: service.id,
          name: service.name,
          durationMin: service.durationMin,
          price: service.price.toString(),
          active: service.active,
        }}
      />
    </div>
  )
}
